import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as request from 'supertest'
import { adminUser } from '../../data'
import { checkOrCreateUser, getModuleFixture, initApp } from '../../helper'

describe('POST /auth/login', () => {
  const url = '/auth/login'
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture = await getModuleFixture()
    await checkOrCreateUser(moduleFixture, adminUser)
    app = await initApp(moduleFixture)
  })

  afterAll(async () => {
    await app.close()
  })

  test('should return 201 with a correct token if correct credentials', async () => {
    await request(app.getHttpServer())
      .post(url)
      .send({
        email: 'test@admin.test',
        password: 'testPass',
      })
      .expect(201)
      .expect((res) => {
        const { token } = res.body

        expect(token).toBeDefined()
        expect(token).toEqual(expect.any(String))

        const jwt = new JwtService()
        const user = jwt.verify(token, {
          publicKey: process.env.PUBLIC_KEY,
          algorithms: ['RS256'],
        })

        expect(user).toBeDefined()
        expect(user.name).toBe('testName')
        expect(user.email).toBe('test@admin.test')
        expect(user.role).toBe('admin')
      })
  })

  test('should return 401 if incorrect credentials', async () => {
    await request(app.getHttpServer())
      .post(url)
      .send({
        email: 'wrong@admin.test',
        password: 'testPass',
      })
      .expect(401)

    await request(app.getHttpServer())
      .post(url)
      .send({
        email: 'test@admin.test',
        password: 'wrong',
      })
      .expect(401)
  })

  test('should return 400 if incorrect wrong request body', async () => {
    await request(app.getHttpServer())
      .post(url)
      .send({
        email: 'wrong',
        password: 'testPass',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['email must be an email'],
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .post(url)
      .send({
        email: 'wrong',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'email must be an email',
          'password should not be empty',
          'password must be a string',
        ],
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .post(url)
      .send({
        password: {
          wrong: 'data',
        },
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'email should not be empty',
          'email must be an email',
          'password must be a string',
        ],
        error: 'Bad Request',
      })
  })
})
