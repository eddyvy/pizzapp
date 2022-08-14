import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import {
  checkOrCreateUser,
  createToken,
  getModuleFixture,
  initApp,
} from '../../helper'
import { CreateUserDto } from '../../../src/user/dto'
import { UserRole } from '../../../src/user/enum/user-role.enum'
import { UserType } from '../../../src/user/types/user.types'
import { UserModule } from '../../../src/user/user.module'
import { UserService } from '../../../src/user/user.service'

describe('POST /users', () => {
  const url = '/users'
  let app: INestApplication
  let userService: UserService

  const adminUser: CreateUserDto = {
    email: 'test@admin.test',
    name: 'testName',
    password: 'testPass',
    role: UserRole.ADMIN,
  }

  const notAdminUser: CreateUserDto = {
    email: 'test@user.test',
    name: 'testNameUser',
    password: 'testPass',
    role: UserRole.USER,
  }

  beforeAll(async () => {
    const moduleFixture = await getModuleFixture()
    await checkOrCreateUser(moduleFixture, adminUser)
    await checkOrCreateUser(moduleFixture, notAdminUser)

    userService = moduleFixture.select(UserModule).get(UserService)
    app = await initApp(moduleFixture)
  })

  afterAll(async () => {
    await app.close()
  })

  test('should return 201 with the new user created', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `user${now}`,
        email: `user${now}@mail.test`,
        password: 'pass',
        role: 'user',
      })
      .expect(201)
      .expect((res) => {
        const user = res.body

        expect(user).toBeDefined()
        expect(user.id).toEqual(expect.any(String))
        expect(user.name).toBe(`user${now}`)
        expect(user.email).toBe(`user${now}@mail.test`)
        expect(user.role).toBe('user')

        const { password, hash } = user
        expect(password).not.toBeDefined()
        expect(hash).not.toBeDefined()
      })
  })

  test('should return 400 with wrong request body', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `user${now}`,
        password: 'pass',
        role: 'user',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['email should not be empty', 'email must be an email'],
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send([
        {
          name: `user${now}`,
          email: `user${now}@mail.test`,
          password: 'pass',
          role: 'user',
        },
        {
          name: `user${now}2`,
          email: `user${now}2@mail.test`,
          password: 'pass',
          role: 'user',
        },
      ])
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'email should not be empty',
          'email must be an email',
          'name should not be empty',
          'name must be a string',
          'password should not be empty',
          'password must be a string',
          'role must be a valid enum value',
        ],
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `user${now}`,
        email: `user${now}@mail.test`,
        password: 'pass',
        role: 'wrong',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['role must be a valid enum value'],
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        email: `user${now}@mail.test`,
        password: 'pass',
        role: 'admin',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['name should not be empty', 'name must be a string'],
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `user${now}`,
        email: `user${now}`,
        password: 'pass',
        role: 'user',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['email must be an email'],
        error: 'Bad Request',
      })
  })

  test('should return 401 if invalid or null token', async () => {
    const now = Date.now().valueOf()

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', 'Bearer wrong token')
      .send({
        name: `user${now}`,
        email: `user${now}@mail.test`,
        password: 'pass',
        role: 'user',
      })
      .expect(401)
      .expect({
        statusCode: 401,
        message: 'Unauthorized',
      })

    await request(app.getHttpServer())
      .post(url)
      .send({
        name: `user${now}`,
        email: `user${now}@mail.test`,
        password: 'pass',
        role: 'user',
      })
      .expect(401)
      .expect({
        statusCode: 401,
        message: 'Unauthorized',
      })
  })

  test('should return 403 if is not an admin user', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      notAdminUser.email,
      notAdminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `user${now}`,
        email: `user${now}@mail.test`,
        password: 'pass',
        role: 'user',
      })
      .expect(403)
      .expect({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      })
  })

  test('should return 409 if the email already exists', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `user${now}`,
        email: `test@user.test`,
        password: 'pass',
        role: 'user',
      })
      .expect(409)
      .expect({
        statusCode: 409,
        message: 'Resource already exists',
        error: 'Conflict',
      })
  })
})
