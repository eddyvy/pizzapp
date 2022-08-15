import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { ObjectId } from 'bson'
import { getModuleFixture, initApp } from '../../helper'
import { IngredientModule } from '../../../src/ingredient/ingredient.module'
import { IngredientService } from '../../../src/ingredient/ingredient.service'

describe('GET /ingredients/:id', () => {
  const url = '/ingredients'
  let app: INestApplication
  let ingredientService: IngredientService

  beforeAll(async () => {
    const moduleFixture = await getModuleFixture()
    ingredientService = moduleFixture
      .select(IngredientModule)
      .get(IngredientService)
    app = await initApp(moduleFixture)
  })

  afterAll(async () => {
    await app.close()
  })

  test('should return 200 with the correct ingredient information', async () => {
    const now = Date.now().valueOf()
    const ingredientToGet = await ingredientService.create({
      name: `ingredient${now}`,
      isGlutenFree: true,
      isNutFree: true,
      isLactoseFree: true,
      isFishFree: true,
      isVegetarian: true,
      isVegan: true,
      spicyLevel: 0,
      extraPrice: 1.5,
    })

    await request(app.getHttpServer())
      .get(`${url}/${ingredientToGet.id}`)
      .expect(200)
      .expect((res) => {
        const ingredient = res.body

        expect(ingredient).toBeDefined()
        expect(ingredient).toEqual(ingredientToGet)
      })
  })

  test('should return 400 if the id is invalid', async () => {
    await request(app.getHttpServer()).get(`${url}/null`).expect(400).expect({
      statusCode: 400,
      message: 'Invalid id',
      error: 'Bad Request',
    })
  })

  test('should return 404 if the ingredient does not exist', async () => {
    const id = new ObjectId().toString()

    await request(app.getHttpServer()).get(`${url}/${id}`).expect(404).expect({
      statusCode: 404,
      message: 'Not Found',
    })
  })
})
