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

describe('DELETE /orders/:id', () => {
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

    const orderToDelete = await orderService.create(testDataOrder)

    await request(app.getHttpServer())
      .delete(`${url}/${orderToDelete.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(200)
      .expect({
        success: true,
      })

    const deletedOrder = await orderService.findOne(orderToDelete.id)
    expect(deletedOrder).toBeNull()
  })

  test('should return 400 with with wrong id param', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .delete(`${url}/wrong`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Invalid id',
        error: 'Bad Request',
      })
  })

  test('should return 403 if is not an admin user', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      notAdminUser.email,
      notAdminUser.password,
    )
    const myToken = createToken(me)

    const orderToDelete = await orderService.create(testDataOrder)

    await request(app.getHttpServer())
      .delete(`${url}/${orderToDelete.id}`)
      .set('Authorization', `Bearer ${myToken}`)
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
      .delete(`${url}/${id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(422)
      .expect({
        statusCode: 422,
        message: 'Order does not exist',
        error: 'Unprocessable Entity',
      })
  })
})
