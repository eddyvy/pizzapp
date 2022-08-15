import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { ObjectId } from 'bson'
import { adminUser, notAdminUser } from '../../data'
import {
  checkOrCreateUser,
  createToken,
  getModuleFixture,
  initApp,
} from '../../helper'
import { UserRole } from '../../../src/user/enum/user-role.enum'
import { UserType } from '../../../src/user/types/user.types'
import { UserModule } from '../../../src/user/user.module'
import { UserService } from '../../../src/user/user.service'

describe('PATCH /users/:id', () => {
  const url = '/users'
  let app: INestApplication
  let userService: UserService

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

  test('should return 200 with the success message', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const userToPatch = await userService.create({
      name: `user${now}`,
      email: `user${now}@mail.test`,
      password: 'pass',
      role: UserRole.USER,
    })

    await request(app.getHttpServer())
      .patch(`${url}/${userToPatch.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `updated_user${now}`,
        email: `updated_user${now}@mail.test`,
      })
      .expect(200)
      .expect({
        success: true,
      })
  })

  test('should return 400 with with wrong request body', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const userToPatch = await userService.create({
      name: `user${now}`,
      email: `user${now}@mail.test`,
      password: 'pass',
      role: UserRole.USER,
    })

    await request(app.getHttpServer())
      .patch(`${url}/${userToPatch.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        incorrect: `updated_user${now}`,
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Bad Request',
      })
  })

  test('should return 400 with with wrong id param', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .patch(`${url}/wrong`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `updated_user${now}`,
        email: `updated_user${now}@mail.test`,
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Invalid id',
        error: 'Bad Request',
      })
  })

  test('should return 403 if is not an admin user', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      notAdminUser.email,
      notAdminUser.password,
    )
    const myToken = createToken(me)

    const userToPatch = await userService.create({
      name: `user${now}`,
      email: `user${now}@mail.test`,
      password: 'pass',
      role: UserRole.USER,
    })

    await request(app.getHttpServer())
      .patch(`${url}/${userToPatch.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `updated_user${now}`,
        email: `updated_user${now}@mail.test`,
      })
      .expect(403)
      .expect({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      })
  })

  test('should return 422 if the user does not exist', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const id = new ObjectId().toString()

    await request(app.getHttpServer())
      .patch(`${url}/${id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `updated_user${now}`,
        email: `updated_user${now}@mail.test`,
      })
      .expect(422)
      .expect({
        statusCode: 422,
        message: 'User does not exist',
        error: 'Unprocessable Entity',
      })
  })
})
