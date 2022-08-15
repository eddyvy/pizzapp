import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { ObjectId } from 'bson'
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

describe('PATCH /ingredients/:id', () => {
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

  test('should return 200 with the success message', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const ingredientToUpdate = await ingredientService.create({
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
      .patch(`${url}/${ingredientToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        isNutFree: false,
        isLactoseFree: false,
        spicyLevel: 2,
      })
      .expect(200)
      .expect({
        success: true,
      })

    const updatedIngredient = await ingredientService.findOne(
      ingredientToUpdate.id,
    )

    expect(updatedIngredient).toMatchObject({
      id: expect.any(String),
      name: `ingredient${now}`,
      isGlutenFree: true,
      isNutFree: false,
      isLactoseFree: false,
      isFishFree: true,
      isVegetarian: true,
      isVegan: true,
      spicyLevel: 2,
      extraPrice: 1.5,
    })
  })

  test('should return 400 with wrong id param', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    await request(app.getHttpServer())
      .patch(`${url}/wrong`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        isNutFree: false,
        isLactoseFree: false,
        spicyLevel: 2,
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Invalid id',
        error: 'Bad Request',
      })
  })

  test('should return 400 with wrong request body', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const ingredientToUpdate = await ingredientService.create({
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
      .patch(`${url}/${ingredientToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        isNutFree: 14323344,
        isLactoseFree: 'wrong',
        spicyLevel: 2,
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'isNutFree must be a boolean value',
          'isLactoseFree must be a boolean value',
        ],
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .patch(`${url}/${ingredientToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Bad Request',
      })
  })

  test('should return 400 with insecure or invalid spicy level', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const ingredientToUpdate = await ingredientService.create({
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
      .patch(`${url}/${ingredientToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        isNutFree: true,
        isLactoseFree: false,
        spicyLevel: 500,
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Spicy level cannot be more than 5, could be so dangerous!!',
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .patch(`${url}/${ingredientToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        isNutFree: true,
        isLactoseFree: false,
        spicyLevel: -23,
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

    const ingredientToUpdate = await ingredientService.create({
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
      .patch(`${url}/${ingredientToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        isNutFree: false,
        isLactoseFree: false,
        spicyLevel: 2,
      })
      .expect(403)
      .expect({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      })
  })

  test('should return 422 if the ingredient does not exist', async () => {
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const id = new ObjectId().toString()

    await request(app.getHttpServer())
      .patch(`${url}/${id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        isNutFree: false,
        isLactoseFree: false,
        spicyLevel: 2,
      })
      .expect(422)
      .expect({
        statusCode: 422,
        message: 'Ingredient does not exist',
        error: 'Unprocessable Entity',
      })
  })

  test('should return 418 if you try to add pineapple', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      adminUser.email,
      adminUser.password,
    )
    const myToken = createToken(me)

    const ingredientToUpdate = await ingredientService.create({
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
      .patch(`${url}/${ingredientToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: 'pineapple',
      })
      // .expect(418)
      .expect({
        statusCode: 418,
        message:
          'Pineapples are bad, pineapples are not your friend in a pizza!',
        error: "I'm a teapot",
      })
  })
})
