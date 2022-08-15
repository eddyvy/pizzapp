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
  getModuleFixture,
  initApp,
  checkOrCreatePizzaSizes,
  checkOrCreatePizzas,
  createToken,
} from '../../helper'
import { UserType } from '../../../src/user/types/user.types'
import { UserModule } from '../../../src/user/user.module'
import { UserService } from '../../../src/user/user.service'
import { OrderService } from '../../../src/order/order.service'
import { OrderModule } from '../../../src/order/order.module'

describe('GET /orders/:id', () => {
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

  test('should return 200 with the correct order information', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)
    const orderToGet = await orderService.create(testDataOrder)

    await request(app.getHttpServer())
      .get(`${url}/${orderToGet.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(200)
      .expect((res) => {
        const order = res.body
        expect(order).toBeDefined()
        expect(order).toEqual(orderToGet)
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

  test('should return 401 if invalid credentials', async () => {
    const orderToGet = await orderService.create(testDataOrder)

    await request(app.getHttpServer())
      .get(`${url}/${orderToGet.id}`)
      .set('Authorization', `Bearer wrong`)
      .expect(401)
      .expect({
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
    const orderToGet = await orderService.create(testDataOrder)

    await request(app.getHttpServer())
      .get(`${url}/${orderToGet.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(403)
      .expect({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      })
  })

  test('should return 404 if the order does not exist', async () => {
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
