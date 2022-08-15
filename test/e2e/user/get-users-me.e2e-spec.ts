import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { adminUser, notAdminUser } from '../../data'
import {
  checkOrCreateUser,
  createToken,
  getModuleFixture,
  initApp,
} from '../../helper'
import { UserType } from '../../../src/user/types/user.types'
import { UserModule } from '../../../src/user/user.module'
import { UserService } from '../../../src/user/user.service'

describe('GET /users/me', () => {
  const url = '/users/me'
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

  test('should return 200 with the users information', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(200)
      .expect((res) => {
        const user = res.body

        expect(user).toBeDefined()
        expect(user).toEqual(me)
      })
  })

  test('should return 200 with the users information if is not an admin', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      notAdminUser.email,
      notAdminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(200)
      .expect((res) => {
        const user = res.body

        expect(user).toBeDefined()
        expect(user).toEqual(me)
      })
  })

  test('should return 401 if invalid or null token', async () => {
    await request(app.getHttpServer())
      .get(url)
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
})
