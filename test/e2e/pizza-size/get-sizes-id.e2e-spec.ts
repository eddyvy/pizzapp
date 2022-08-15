import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { ObjectId } from 'bson'
import { getModuleFixture, initApp } from '../../helper'
import { PizzaSizeModule } from '../../../src/pizza-size/pizza-size.module'
import { PizzaSizeService } from '../../../src/pizza-size/pizza-size.service'

describe('GET /sizes/:id', () => {
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

  test('should return 200 with the correct pizzaSize information', async () => {
    const now = Date.now().valueOf()
    const pizzaSizeToGet = await pizzaSizeService.create({
      name: `pizzaSize${now}`,
      centimeters: now,
      priceIncPct: 25,
    })

    await request(app.getHttpServer())
      .get(`${url}/${pizzaSizeToGet.id}`)
      .expect(200)
      .expect((res) => {
        const pizzaSize = res.body

        expect(pizzaSize).toBeDefined()
        expect(pizzaSize).toEqual(pizzaSizeToGet)
      })
  })

  test('should return 400 if the id is invalid', async () => {
    await request(app.getHttpServer()).get(`${url}/null`).expect(400).expect({
      statusCode: 400,
      message: 'Invalid id',
      error: 'Bad Request',
    })
  })

  test('should return 404 if the pizzaSize does not exist', async () => {
    const id = new ObjectId().toString()

    await request(app.getHttpServer()).get(`${url}/${id}`).expect(404).expect({
      statusCode: 404,
      message: 'Not Found',
    })
  })
})
