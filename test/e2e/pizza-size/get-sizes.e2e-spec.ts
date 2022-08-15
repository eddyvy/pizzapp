import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { getModuleFixture, initApp } from '../../helper'
import { PizzaSizeModule } from '../../../src/pizza-size/pizza-size.module'
import { PizzaSizeService } from '../../../src/pizza-size/pizza-size.service'

describe('GET /sizes', () => {
  const url = '/sizes'
  let app: INestApplication
  let pizzaSizeService: PizzaSizeService

  beforeAll(async () => {
    const moduleFixture = await getModuleFixture()
    pizzaSizeService = moduleFixture
      .select(PizzaSizeModule)
      .get(PizzaSizeService)
    app = await initApp(moduleFixture)
  })

  afterAll(async () => {
    await app.close()
  })

  test('should return 200 with an empty array if there are no pizza sizes', async () => {
    await pizzaSizeService.removeAll()

    await request(app.getHttpServer()).get(url).expect(200).expect([])
  })

  test('should return 200 with all pizza sizes and their correct information', async () => {
    const now = Date.now().valueOf()

    await pizzaSizeService.removeAll()

    const pizzaSizesForDb = [
      {
        name: `pizzaSize${now}`,
        centimeters: now,
        priceIncPct: 0,
      },
      {
        name: `pizzaSize${now + 1}`,
        centimeters: now + 1,
        priceIncPct: 25,
      },
    ]

    for (const pizzaSizeForDb of pizzaSizesForDb) {
      await pizzaSizeService.create(pizzaSizeForDb)
    }

    await request(app.getHttpServer())
      .get(url)
      .expect(200)
      .expect((res) => {
        const pizzaSizes = res.body

        expect(pizzaSizes).toBeDefined()
        expect(pizzaSizes.length).toBe(2)
        expect(pizzaSizes).toMatchObject([
          {
            id: expect.any(String),
            name: `pizzaSize${now}`,
            centimeters: now,
            priceIncPct: 0,
          },
          {
            id: expect.any(String),
            name: `pizzaSize${now + 1}`,
            centimeters: now + 1,
            priceIncPct: 25,
          },
        ])
      })
  })
})
