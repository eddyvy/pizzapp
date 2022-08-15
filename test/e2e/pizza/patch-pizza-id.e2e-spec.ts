import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { ObjectId } from 'bson'
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

describe('PATCH /pizzas/:id', () => {
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

  test('should return 200 with the success message', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const pizzaToUpdate = await pizzaService.create({
      name: `pizza${now}`,
      basicPrice: 12,
      ingredients: ['tomato', 'cheese'],
    })

    await request(app.getHttpServer())
      .patch(`${url}/${pizzaToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        basicPrice: 15,
        ingredients: ['tomato', 'cheese', 'ham'],
      })
      .expect(200)
      .expect({
        success: true,
      })

    const updatedpizza = await pizzaService.findOne(pizzaToUpdate.id)

    expect(updatedpizza).toMatchObject({
      id: expect.any(String),
      name: `pizza${now}`,
      basicPrice: 15,
      ingredients: ['tomato', 'cheese', 'ham'],
    })
  })

  test('should return 400 with wrong id param', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .patch(`${url}/wrong`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        basicPrice: 12,
        ingredients: ['tomato', 'cheese'],
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Invalid id',
        error: 'Bad Request',
      })
  })

  test('should return 400 with wrong request body', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const pizzaToUpdate = await pizzaService.create({
      name: `pizza${now}`,
      basicPrice: 12,
      ingredients: ['tomato', 'cheese'],
    })

    await request(app.getHttpServer())
      .patch(`${url}/${pizzaToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: 123,
        basicPrice: ['wrong'],
        ingredients: 'unknown',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'name must be a string',
          'ingredients must be an array',
          'basicPrice must be a number conforming to the specified constraints',
        ],
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .patch(`${url}/${pizzaToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Bad Request',
      })
  })

  test('should return 400 with a tasteless pizza! (ingredients empty array)', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const pizzaToUpdate = await pizzaService.create({
      name: `pizza${now}`,
      basicPrice: 12,
      ingredients: ['tomato', 'cheese'],
    })

    await request(app.getHttpServer())
      .patch(`${url}/${pizzaToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        basicPrice: 15,
        ingredients: [],
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Your pizza without ingredients is tasteless!',
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

    const pizzaToUpdate = await pizzaService.create({
      name: `pizza${now}`,
      basicPrice: 12,
      ingredients: ['tomato', 'cheese'],
    })

    await request(app.getHttpServer())
      .patch(`${url}/${pizzaToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        basicPrice: 15,
        ingredients: ['tomato', 'cheese', 'ham'],
      })
      .expect(403)
      .expect({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      })
  })

  test('should return 422 if the pizza does not exist', async () => {
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
        basicPrice: 15,
        ingredients: ['tomato', 'cheese', 'ham'],
      })
      .expect(422)
      .expect({
        statusCode: 422,
        message: 'Pizza does not exist',
        error: 'Unprocessable Entity',
      })
  })

  test('should return 422 if ingredient does not exist', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const pizzaToUpdate = await pizzaService.create({
      name: `pizza${now}`,
      basicPrice: 12,
      ingredients: ['tomato', 'cheese'],
    })

    await request(app.getHttpServer())
      .patch(`${url}/${pizzaToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
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
