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

describe('DELETE /pizzas/:id', () => {
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

    const pizzaToDelete = await pizzaService.create({
      name: `pizza${now}`,
      basicPrice: 12,
      ingredients: ['tomato', 'cheese'],
    })

    await request(app.getHttpServer())
      .delete(`${url}/${pizzaToDelete.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(200)
      .expect({
        success: true,
      })

    const deletedpizza = await pizzaService.findOne(pizzaToDelete.id)
    expect(deletedpizza).toBeNull()
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
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      notAdminUser.email,
      notAdminUser.password,
    )
    const myToken = createToken(me)

    const pizzaToDelete = await pizzaService.create({
      name: `pizza${now}`,
      basicPrice: 12,
      ingredients: ['tomato', 'cheese'],
    })

    await request(app.getHttpServer())
      .delete(`${url}/${pizzaToDelete.id}`)
      .set('Authorization', `Bearer ${myToken}`)
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
      .delete(`${url}/${id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(422)
      .expect({
        statusCode: 422,
        message: 'Pizza does not exist',
        error: 'Unprocessable Entity',
      })
  })
})
