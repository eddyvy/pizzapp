import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { ObjectId } from 'bson'
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
  createToken,
  getModuleFixture,
  initApp,
  checkOrCreatePizzaSizes,
  checkOrCreatePizzas,
} from '../../helper'
import { UserType } from '../../../src/user/types/user.types'
import { UserModule } from '../../../src/user/user.module'
import { UserService } from '../../../src/user/user.service'
import { OrderService } from '../../../src/order/order.service'
import { OrderModule } from '../../../src/order/order.module'

describe('PATCH /orders/:id', () => {
  const url = '/orders'
  let app: INestApplication
  let userService: UserService
  let orderService: OrderService

  beforeAll(async () => {
    const moduleFixture = await getModuleFixture()

    await checkOrCreateUser(moduleFixture, adminUser)
    await checkOrCreateUser(moduleFixture, notAdminUser)
    await chekOrCreateIngredients(moduleFixture, testDataIngredients)
    await checkOrCreatePizzaSizes(moduleFixture, testDataPizzaSizes)
    await checkOrCreatePizzas(moduleFixture, testDataPizzas)

    orderService = moduleFixture.select(OrderModule).get(OrderService)
    userService = moduleFixture.select(UserModule).get(UserService)
    app = await initApp(moduleFixture)
  })

  afterAll(async () => {
    await app.close()
  })

  test('should return 200 with the success message', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const orderToUpdate = await orderService.create(testDataOrder)

    await request(app.getHttpServer())
      .patch(`${url}/${orderToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        pizzaOrders: [
          {
            pizza: 'margarita',
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
        discount: 20,
        orderState: 2,
      })
      .expect(200)
      .expect({
        success: true,
      })

    const updatedOrder = await orderService.findOne(orderToUpdate.id)

    expect(updatedOrder).toMatchObject({
      id: expect.any(String),
      customer: orderToUpdate.customer,
      pizzaOrders: [
        {
          pizza: 'margarita',
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
      discount: 20,
      price: 34.24,
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
        discount: 20,
        orderState: 2,
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Invalid id',
        error: 'Bad Request',
      })
  })

  test('should return 400 with wrong request body', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const orderToUpdate = await orderService.create(testDataOrder)

    await request(app.getHttpServer())
      .patch(`${url}/${orderToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
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
          'pizzaOrders.0.pizza must be a string',
          'discount must be a number conforming to the specified constraints',
          'orderState must be a valid enum value',
        ],
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .patch(`${url}/${orderToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Bad Request',
      })
  })

  test('should return 403 if is not an admin user', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      notAdminUser.email,
      notAdminUser.password,
    )
    const myToken = createToken(me)

    const orderToUpdate = await orderService.create(testDataOrder)

    await request(app.getHttpServer())
      .patch(`${url}/${orderToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        discount: 20,
        orderState: 2,
      })
      .expect(403)
      .expect({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      })
  })

  test('should return 422 if the order does not exist', async () => {
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
        discount: 20,
        orderState: 2,
      })
      .expect(422)
      .expect({
        statusCode: 422,
        message: 'Order does not exist',
        error: 'Unprocessable Entity',
      })
  })

  test('should return 422 if ingredient does not exist', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const orderToUpdate = await orderService.create(testDataOrder)

    await request(app.getHttpServer())
      .patch(`${url}/${orderToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        pizzaOrders: [
          {
            pizza: 'margarita',
            extraIngredients: ['stone', 'basil'],
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
      .expect(422)
      .expect({
        statusCode: 422,
        message:
          "It seems you've tried to use stone as ingredient... sounds weird for us!",
        error: 'Unprocessable Entity',
      })
  })

  test('should return 422 if pizza does not exist', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const orderToUpdate = await orderService.create(testDataOrder)

    await request(app.getHttpServer())
      .patch(`${url}/${orderToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        pizzaOrders: [
          {
            pizza: 'dormakaba',
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
      .expect(422)
      .expect({
        statusCode: 422,
        message:
          "Sorry, we don't have the pizza named 'dormakaba', but would be a nice name for a pizza!",
        error: 'Unprocessable Entity',
      })
  })

  test('should return 422 if pizza size does not exist', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const orderToUpdate = await orderService.create(testDataOrder)

    await request(app.getHttpServer())
      .patch(`${url}/${orderToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        pizzaOrders: [
          {
            pizza: 'margarita',
            extraIngredients: ['ham', 'basil'],
            size: 'magicsize',
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
      .expect(422)
      .expect({
        statusCode: 422,
        message: "Sorry, we don't have pizzas with size 'magicsize'",
        error: 'Unprocessable Entity',
      })
  })
})
