import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { adminUser, notAdminUser } from '../../data'
import {
  checkOrCreateUser,
  createToken,
  getModuleFixture,
  initApp,
} from '../../helper'
import { UserType } from '../../../src/user/types/user.types'
import { UserModule } from '../../../src/user/user.module'
import { UserService } from '../../../src/user/user.service'
import { IngredientModule } from '../../../src/ingredient/ingredient.module'
import { IngredientService } from '../../../src/ingredient/ingredient.service'

describe('POST /ingredients', () => {
  const url = '/ingredients'
  let app: INestApplication
  let userService: UserService
  let ingredientService: IngredientService

  beforeAll(async () => {
    const moduleFixture = await getModuleFixture()
    await checkOrCreateUser(moduleFixture, adminUser)
    await checkOrCreateUser(moduleFixture, notAdminUser)

    ingredientService = moduleFixture
      .select(IngredientModule)
      .get(IngredientService)
    userService = moduleFixture.select(UserModule).get(UserService)
    app = await initApp(moduleFixture)
  })

  afterAll(async () => {
    await app.close()
  })

  test('should return 201 with the new ingredient created', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
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
      .expect(201)
      .expect((res) => {
        expect(res.body).toBeDefined()
        expect(res.body).toMatchObject({
          id: expect.any(String),
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
      })
  })

  test('should return 400 with wrong request body', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'name should not be empty',
          'name must be a string',
          'isGlutenFree should not be null or undefined',
          'isGlutenFree must be a boolean value',
          'isNutFree should not be null or undefined',
          'isNutFree must be a boolean value',
          'isLactoseFree should not be null or undefined',
          'isLactoseFree must be a boolean value',
          'isFishFree should not be null or undefined',
          'isFishFree must be a boolean value',
          'isVegetarian should not be null or undefined',
          'isVegetarian must be a boolean value',
          'isVegan should not be null or undefined',
          'isVegan must be a boolean value',
          'spicyLevel should not be null or undefined',
          'spicyLevel must be a number conforming to the specified constraints',
          'extraPrice should not be null or undefined',
          'extraPrice must be a number conforming to the specified constraints',
        ],
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `ingredient${now}`,
        isNutFree: true,
        isLactoseFree: true,
        isFishFree: true,
        isVegetarian: true,
        isVegan: true,
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'isGlutenFree should not be null or undefined',
          'isGlutenFree must be a boolean value',
          'spicyLevel should not be null or undefined',
          'spicyLevel must be a number conforming to the specified constraints',
          'extraPrice should not be null or undefined',
          'extraPrice must be a number conforming to the specified constraints',
        ],
        error: 'Bad Request',
      })
  })

  test('should return 400 with insecure or invalid spicy level', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `ingredient${now}`,
        isGlutenFree: true,
        isNutFree: true,
        isLactoseFree: true,
        isFishFree: true,
        isVegetarian: true,
        isVegan: true,
        spicyLevel: 50,
        extraPrice: 1.5,
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Spicy level cannot be more than 5, could be so dangerous!!',
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `ingredient${now}`,
        isGlutenFree: true,
        isNutFree: true,
        isLactoseFree: true,
        isFishFree: true,
        isVegetarian: true,
        isVegan: true,
        spicyLevel: -23,
        extraPrice: 1.5,
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Spicy level cannot be less than 0',
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

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
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
      .expect(403)
      .expect({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      })
  })

  test('should return 409 if the ingredient already exists', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await ingredientService.create({
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
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
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
      .expect(409)
      .expect({
        statusCode: 409,
        message: 'Resource already exists',
        error: 'Conflict',
      })
  })

  test('should return 418 if you try to add pineapple', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: 'pineapple',
        isGlutenFree: true,
        isNutFree: true,
        isLactoseFree: true,
        isFishFree: true,
        isVegetarian: true,
        isVegan: true,
        spicyLevel: 0,
        extraPrice: 1.5,
      })
      .expect(418)
      .expect({
        statusCode: 418,
        message:
          'Pineapples are bad, pineapples are not your friend in a pizza!',
        error: "I'm a teapot",
      })
  })
})
