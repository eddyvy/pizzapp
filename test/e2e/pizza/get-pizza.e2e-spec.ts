import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { testDataIngredients } from '../../data'
import { getModuleFixture, initApp } from '../../helper'
import { chekOrCreateIngredients } from '../../helper/ingredient'
import { PizzaModule } from '../../../src/pizza/pizza.module'
import { PizzaService } from '../../../src/pizza/pizza.service'

describe('GET /pizzas', () => {
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

  test('should return 200 with an empty array if there are no pizzas', async () => {
    await pizzaService.removeAll()

    await request(app.getHttpServer()).get(url).expect(200).expect([])
  })

  test('should return 200 with all pizzas and their correct information', async () => {
    const now = Date.now().valueOf()

    await pizzaService.removeAll()

    const pizzasForDb = [
      {
        name: `pizza${now}1`,
        basicPrice: 12,
        ingredients: ['tomato', 'cheese'],
      },
      {
        name: `pizza${now}2`,
        basicPrice: 12,
        ingredients: ['cream', 'cheese'],
      },
    ]

    for (const pizzaForDb of pizzasForDb) {
      await pizzaService.create(pizzaForDb)
    }

    await request(app.getHttpServer())
      .get(url)
      .expect(200)
      .expect((res) => {
        const pizzas = res.body

        expect(pizzas).toBeDefined()
        expect(pizzas.length).toBe(2)
        expect(pizzas).toMatchObject([
          {
            id: expect.any(String),
            name: `pizza${now}1`,
            basicPrice: 12,
            ingredients: ['tomato', 'cheese'],
          },
          {
            id: expect.any(String),
            name: `pizza${now}2`,
            basicPrice: 12,
            ingredients: ['cream', 'cheese'],
          },
        ])
      })
  })
})
