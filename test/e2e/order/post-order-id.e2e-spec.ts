import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import {
  adminUser,
  notAdminUser,
  testDataIngredients,
  testDataPizzaSizes,
  testDataPizzas,
  testDataOrder,
} from '../../data'
import {
  chekOrCreateIngredients,
  checkOrCreateUser,
  getModuleFixture,
  initApp,
  checkOrCreatePizzaSizes,
  checkOrCreatePizzas,
} from '../../helper'

describe('POST /orders', () => {
  const url = '/orders'
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture = await getModuleFixture()

    await checkOrCreateUser(moduleFixture, adminUser)
    await checkOrCreateUser(moduleFixture, notAdminUser)
    await chekOrCreateIngredients(moduleFixture, testDataIngredients)
    await checkOrCreatePizzaSizes(moduleFixture, testDataPizzaSizes)
    await checkOrCreatePizzas(moduleFixture, testDataPizzas)

    app = await initApp(moduleFixture)
  })

  afterAll(async () => {
    await app.close()
  })

  test('should return 201 with the success message', async () => {
    await request(app.getHttpServer())
      .post(url)
      .send(testDataOrder)
      .expect(201)
      .expect((res) => {
        const order = res.body
        expect(order).toBeDefined()
        expect(order).toMatchObject({
          id: expect.any(String),
          pizzaOrders: [
            {
              pizza: 'margarita',
              price: 14,
              extraIngredients: ['ham', 'basil'],
              size: 'medium',
            },
            {
              pizza: 'hampizza',
              price: 13.799999999999999,
              extraIngredients: [],
              size: 'large',
            },
          ],
          customer: {
            name: 'John',
            email: 'johndoe@test.com',
            phone: '+41678123123',
            address: 'St. Misterious',
            bankCard: {
              cardNumber: '123456789',
              expireDate: 2660570360,
              secret: '111',
            },
          },
          price: 27.799999999999997,
          discount: 0,
          state: 0,
        })
      })
  })

  test('should return 400 with wrong request body', async () => {
    await request(app.getHttpServer())
      .post(url)
      .send({
        discount: { wrong: 'data' },
        orderState: 'wrong',
        pizzaOrders: [
          {
            notPizza: 'margarita',
            extraIngredients: ['ham', 'basil'],
            size: 'medium',
          },
          {
            pizza: 'hampizza',
            extraIngredients: [],
            size: 'large',
          },
          {
            pizza: 'hampizza',
            extraIngredients: [],
            size: 'familiar',
          },
        ],
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'customer should not be null or undefined',
          'pizzaOrders.0.pizza should not be null or undefined',
          'pizzaOrders.0.pizza must be a string',
        ],
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .post(url)
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'customer should not be null or undefined',
          'pizzaOrders should not be null or undefined',
        ],
        error: 'Bad Request',
      })
  })

  test('should return 422 if ingredient does not exist', async () => {
    await request(app.getHttpServer())
      .post(url)
      .send({
        pizzaOrders: [
          {
            pizza: 'superpizza',
            extraIngredients: [],
            size: 'large',
          },
          {
            pizza: 'creampizza',
            extraIngredients: ['stone', 'basil'],
            size: 'medium',
          },
        ],
        customer: {
          name: 'Tom',
          email: 'tomdoe@test.com',
          phone: '+41678123123',
          address: 'St. Test',
          bankCard: {
            cardNumber: '123456789',
            expireDate: 2660770360,
            secret: '111',
          },
        },
      })
      .expect(422)
      .expect({
        statusCode: 422,
        message:
          "It seems you've tried to use stone as ingredient... sounds weird for us!",
        error: 'Unprocessable Entity',
      })
  })

  test('should return 422 if pizza does not exist', async () => {
    await request(app.getHttpServer())
      .post(url)
      .send({
        pizzaOrders: [
          {
            pizza: 'dormakaba',
            extraIngredients: [],
            size: 'large',
          },
          {
            pizza: 'creampizza',
            extraIngredients: ['ham', 'basil'],
            size: 'medium',
          },
        ],
        customer: {
          name: 'Tom',
          email: 'tomdoe@test.com',
          phone: '+41678123123',
          address: 'St. Test',
          bankCard: {
            cardNumber: '123456789',
            expireDate: 2660770360,
            secret: '111',
          },
        },
      })
      .expect(422)
      .expect({
        statusCode: 422,
        message:
          "Sorry, we don't have the pizza named 'dormakaba', but would be a nice name for a pizza!",
        error: 'Unprocessable Entity',
      })
  })

  test('should return 422 if pizza size does not exist', async () => {
    await request(app.getHttpServer())
      .post(url)
      .send({
        pizzaOrders: [
          {
            pizza: 'superpizza',
            extraIngredients: [],
            size: 'magicsize',
          },
          {
            pizza: 'creampizza',
            extraIngredients: ['ham', 'basil'],
            size: 'medium',
          },
        ],
        customer: {
          name: 'Tom',
          email: 'tomdoe@test.com',
          phone: '+41678123123',
          address: 'St. Test',
          bankCard: {
            cardNumber: '123456789',
            expireDate: 2660770360,
            secret: '111',
          },
        },
      })
      .expect(422)
      .expect({
        statusCode: 422,
        message: "Sorry, we don't have pizzas with size 'magicsize'",
        error: 'Unprocessable Entity',
      })
  })
})
