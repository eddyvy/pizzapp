import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { getModuleFixture, initApp } from '../../helper'
import { IngredientModule } from '../../../src/ingredient/ingredient.module'
import { IngredientService } from '../../../src/ingredient/ingredient.service'

describe('GET /ingredients', () => {
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

  test('should return 200 with an empty array if there are no ingredients', async () => {
    await ingredientService.removeAll()

    await request(app.getHttpServer()).get(url).expect(200).expect([])
  })

  test('should return 200 with all ingredients and their correct information', async () => {
    const now = Date.now().valueOf()

    await ingredientService.removeAll()

    const igredientsForDb = [
      {
        name: `ingredient${now}1`,
        isGlutenFree: true,
        isNutFree: true,
        isLactoseFree: true,
        isFishFree: true,
        isVegetarian: true,
        isVegan: true,
        spicyLevel: 0,
        extraPrice: 1.5,
      },
      {
        name: `ingredient${now}2`,
        isGlutenFree: true,
        isNutFree: true,
        isLactoseFree: true,
        isFishFree: true,
        isVegetarian: true,
        isVegan: true,
        spicyLevel: 0,
        extraPrice: 1.5,
      },
    ]

    for (const ingredientForDb of igredientsForDb) {
      await ingredientService.create(ingredientForDb)
    }

    await request(app.getHttpServer())
      .get(url)
      .expect(200)
      .expect((res) => {
        const ingredients = res.body

        expect(ingredients).toBeDefined()
        expect(ingredients.length).toBe(2)
        expect(ingredients).toMatchObject([
          {
            id: expect.any(String),
            name: `ingredient${now}1`,
            isGlutenFree: true,
            isNutFree: true,
            isLactoseFree: true,
            isFishFree: true,
            isVegetarian: true,
            isVegan: true,
            spicyLevel: 0,
            extraPrice: 1.5,
          },
          {
            id: expect.any(String),
            name: `ingredient${now}2`,
            isGlutenFree: true,
            isNutFree: true,
            isLactoseFree: true,
            isFishFree: true,
            isVegetarian: true,
            isVegan: true,
            spicyLevel: 0,
            extraPrice: 1.5,
          },
        ])
      })
  })
})
