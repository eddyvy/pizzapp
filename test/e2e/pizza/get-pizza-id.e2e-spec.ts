import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { ObjectId } from 'bson'
import { testDataIngredients } from '../../data'
import { getModuleFixture, initApp } from '../../helper'
import { chekOrCreateIngredients } from '../../helper/ingredient'
import { PizzaModule } from '../../../src/pizza/pizza.module'
import { PizzaService } from '../../../src/pizza/pizza.service'

describe('GET /pizzas/:id', () => {
  const url = '/pizzas'
  let app: INestApplication
  let pizzaService: PizzaService

  beforeAll(async () => {
    const moduleFixture = await getModuleFixture()
    await chekOrCreateIngredients(moduleFixture, testDataIngredients)
    pizzaService = moduleFixture.select(PizzaModule).get(PizzaService)
    app = await initApp(moduleFixture)
  })

  afterAll(async () => {
    await app.close()
  })

  test('should return 200 with the correct pizza information', async () => {
    const now = Date.now().valueOf()
    const pizzaToGet = await pizzaService.create({
      name: `pizza${now}`,
      basicPrice: 12,
      ingredients: ['tomato', 'cheese'],
    })

    await request(app.getHttpServer())
      .get(`${url}/${pizzaToGet.id}`)
      .expect(200)
      .expect((res) => {
        const pizza = res.body

        expect(pizza).toBeDefined()
        expect(pizza).toEqual(pizzaToGet)
      })
  })

  test('should return 400 if the id is invalid', async () => {
    await request(app.getHttpServer()).get(`${url}/null`).expect(400).expect({
      statusCode: 400,
      message: 'Invalid id',
      error: 'Bad Request',
    })
  })

  test('should return 404 if the pizza does not exist', async () => {
    const id = new ObjectId().toString()

    await request(app.getHttpServer()).get(`${url}/${id}`).expect(404).expect({
      statusCode: 404,
      message: 'Not Found',
    })
  })
})
