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
    userService = moduleFixture.select(UserModule).get(UserService)

    await userService.removeAll()
    await checkOrCreateUser(moduleFixture, adminUser)
    await checkOrCreateUser(moduleFixture, notAdminUser)

    app = await initApp(moduleFixture)
  })

  afterAll(async () => {
    await app.close()
  })

  test('should return 200 with all users and their correct information', async () => {
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
        const users = res.body

        expect(users).toBeDefined()
        expect(users.length).toBe(2)
        expect(users).toMatchObject([
          {
            id: expect.any(String),
            name: 'testName',
            email: 'test@admin.test',
            role: 'admin',
          },
          {
            id: expect.any(String),
            name: 'testNameUser',
            email: 'test@user.test',
            role: 'user',
          },
        ])

        const { password, hash } = users[0]
        expect(password).not.toBeDefined()
        expect(hash).not.toBeDefined()
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

  test('should return 403 if is not an admin user', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      notAdminUser.email,
      notAdminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(403)
      .expect({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      })
  })
})
