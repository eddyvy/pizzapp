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

describe('GET /users/:id', () => {
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

  test('should return 200 with the correct user information', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const userToGet = await userService.create({
      name: `user${now}`,
      email: `user${now}@mail.test`,
      password: 'pass',
      role: UserRole.USER,
    })

    await request(app.getHttpServer())
      .get(`${url}/${userToGet.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(200)
      .expect((res) => {
        const user = res.body

        expect(user).toBeDefined()
        expect(user).toEqual(userToGet)
      })
  })

  test('should return 400 if the id is invalid', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .get(`${url}/null`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Invalid id',
        error: 'Bad Request',
      })
  })

  test('should return 401 if invalid or null token', async () => {
    const now = Date.now().valueOf()
    const userToGet = await userService.create({
      name: `user${now}`,
      email: `user${now}@mail.test`,
      password: 'pass',
      role: UserRole.USER,
    })

    await request(app.getHttpServer())
      .get(`${url}/${userToGet.id}`)
      .set('Authorization', 'Bearer wrong token')
      .expect(401)
      .expect({
        statusCode: 401,
        message: 'Unauthorized',
      })

    await request(app.getHttpServer()).get(url).expect(401).expect({
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

    const userToGet = await userService.create({
      name: `user${now}`,
      email: `user${now}@mail.test`,
      password: 'pass',
      role: UserRole.USER,
    })

    await request(app.getHttpServer())
      .get(`${url}/${userToGet.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(403)
      .expect({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      })
  })

  test('should return 404 if the user does not exist', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const id = new ObjectId().toString()

    await request(app.getHttpServer())
      .get(`${url}/${id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'Not Found',
      })
  })
})
