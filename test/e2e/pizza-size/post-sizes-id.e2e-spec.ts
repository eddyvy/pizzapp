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
import { PizzaSizeModule } from '../../../src/pizza-size/pizza-size.module'
import { PizzaSizeService } from '../../../src/pizza-size/pizza-size.service'

describe('POST /sizes', () => {
  const url = '/sizes'
  let app: INestApplication
  let userService: UserService
  let pizzaSizeService: PizzaSizeService

  beforeAll(async () => {
    const moduleFixture = await getModuleFixture()
    await checkOrCreateUser(moduleFixture, adminUser)
    await checkOrCreateUser(moduleFixture, notAdminUser)

    pizzaSizeService = moduleFixture
      .select(PizzaSizeModule)
      .get(PizzaSizeService)
    userService = moduleFixture.select(UserModule).get(UserService)
    app = await initApp(moduleFixture)
  })

  afterAll(async () => {
    await app.close()
  })

  test('should return 201 with the new pizza size created', async () => {
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
        name: `pizzaSize${now}`,
        centimeters: now,
        priceIncPct: 0,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toBeDefined()
        expect(res.body).toMatchObject({
          id: expect.any(String),
          name: `pizzaSize${now}`,
          centimeters: now,
          priceIncPct: 0,
        })
      })
  })

  test('should return 400 with wrong request body', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'name should not be empty',
          'name must be a string',
          'centimeters should not be null or undefined',
          'centimeters must be a number conforming to the specified constraints',
          'priceIncPct should not be null or undefined',
          'priceIncPct must be a number conforming to the specified constraints',
        ],
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: 1000,
        centimeters: 'wrong',
        priceIncPct: ['wrong', 'price'],
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'name must be a string',
          'centimeters must be a number conforming to the specified constraints',
          'priceIncPct must be a number conforming to the specified constraints',
        ],
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

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `pizzaSize${now}`,
        centimeters: now,
        priceIncPct: 0,
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

    await pizzaSizeService.create({
      name: `pizzaSize${now}`,
      centimeters: now,
      priceIncPct: 0,
    })

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `pizzaSize${now}`,
        centimeters: now,
        priceIncPct: 0,
      })
      .expect(409)
      .expect({
        statusCode: 409,
        message: 'Resource already exists',
        error: 'Conflict',
      })
  })
})
