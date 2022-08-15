import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { adminUser, notAdminUser, testDataIngredients } from '../../data'
import {
  chekOrCreateIngredients,
  checkOrCreateUser,
  createToken,
  getModuleFixture,
  initApp,
} from '../../helper'
import { UserType } from '../../../src/user/types/user.types'
import { UserModule } from '../../../src/user/user.module'
import { UserService } from '../../../src/user/user.service'
import { PizzaModule } from '../../../src/pizza/pizza.module'
import { PizzaService } from '../../../src/pizza/pizza.service'

describe('POST /pizzas', () => {
  const url = '/pizzas'
  let app: INestApplication
  let userService: UserService
  let pizzaService: PizzaService

  beforeAll(async () => {
    const moduleFixture = await getModuleFixture()

    await checkOrCreateUser(moduleFixture, adminUser)
    await checkOrCreateUser(moduleFixture, notAdminUser)
    await chekOrCreateIngredients(moduleFixture, testDataIngredients)

    pizzaService = moduleFixture.select(PizzaModule).get(PizzaService)
    userService = moduleFixture.select(UserModule).get(UserService)
    app = await initApp(moduleFixture)
  })

  afterAll(async () => {
    await app.close()
  })

  test('should return 201 with the new pizza created', async () => {
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
        name: `pizza${now}`,
        basicPrice: 12,
        ingredients: ['tomato', 'cheese'],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toBeDefined()
        expect(res.body).toMatchObject({
          id: expect.any(String),
          name: `pizza${now}`,
          basicPrice: 12,
          ingredients: ['tomato', 'cheese'],
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
          'ingredients should not be null or undefined',
          'ingredients must be an array',
          'each value in ingredients must be a string',
          'basicPrice should not be null or undefined',
          'basicPrice must be a number conforming to the specified constraints',
        ],
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: 1234,
        basicPrice: 'wrong',
        ingredients: { wrong: ['tomato', 'cheese'] },
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'name must be a string',
          'ingredients must be an array',
          'each value in ingredients must be a string',
          'basicPrice must be a number conforming to the specified constraints',
        ],
        error: 'Bad Request',
      })
  })

  test('should return 400 with a tasteless pizza! (ingredients empty array)', async () => {
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
        name: `pizza${now}`,
        basicPrice: 12,
        ingredients: [],
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Your pizza without ingredients is tasteless!',
        error: 'Bad Request',
      })
  })

  test('should return 401 if invalid credentials', async () => {
    const now = Date.now().valueOf()

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer wrong`)
      .send({
        name: `pizza${now}`,
        basicPrice: 12,
        ingredients: ['tomato', 'cheese'],
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
        name: `pizza${now}`,
        basicPrice: 12,
        ingredients: ['tomato', 'cheese'],
      })
      .expect(403)
      .expect({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      })
  })

  test('should return 409 if the pizza already exists', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await pizzaService.create({
      name: `pizza${now}`,
      basicPrice: 12,
      ingredients: ['tomato', 'cheese'],
    })

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `pizza${now}`,
        basicPrice: 15,
        ingredients: ['tomato', 'cheese', 'ham'],
      })
      .expect(409)
      .expect({
        statusCode: 409,
        message: 'Resource already exists',
        error: 'Conflict',
      })
  })

  test('should return 422 if ingredient does not exist', async () => {
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
        name: `pizza${now}`,
        basicPrice: 15,
        ingredients: ['tomato', 'cheese', 'stone'],
      })
      .expect(422)
      .expect({
        statusCode: 422,
        message:
          "It seems you've tried to use stone as ingredient... sounds weird for us!",
        error: 'Unprocessable Entity',
      })
  })
})
