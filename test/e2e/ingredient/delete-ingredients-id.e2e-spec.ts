import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { ObjectId } from 'bson'
import {
  checkOrCreateUser,
  createToken,
  getModuleFixture,
  initApp,
} from '../../helper'
import { CreateUserDto } from '../../../src/user/dto'
import { UserRole } from '../../../src/user/enum/user-role.enum'
import { UserType } from '../../../src/user/types/user.types'
import { UserModule } from '../../../src/user/user.module'
import { UserService } from '../../../src/user/user.service'
import { IngredientModule } from '../../../src/ingredient/ingredient.module'
import { IngredientService } from '../../../src/ingredient/ingredient.service'

describe('DELETE /ingredients/:id', () => {
  const url = '/ingredients'
  let app: INestApplication
  let userService: UserService
  let ingredientService: IngredientService

  const adminUser: CreateUserDto = {
    email: 'test@admin.test',
    name: 'testName',
    password: 'testPass',
    role: UserRole.ADMIN,
  }

  const notAdminUser: CreateUserDto = {
    email: 'test@user.test',
    name: 'testNameUser',
    password: 'testPass',
    role: UserRole.USER,
  }

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

    const ingredientToDelete = await ingredientService.create({
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
      .delete(`${url}/${ingredientToDelete.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(200)
      .expect({
        success: true,
      })

    const deletedIngredient = await ingredientService.findOne(
      ingredientToDelete.id,
    )

    expect(deletedIngredient).toBeNull()
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

    const ingredientToDelete = await ingredientService.create({
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
      .delete(`${url}/${ingredientToDelete.id}`)
      .set('Authorization', `Bearer ${myToken}`)
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
      .delete(`${url}/${id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(422)
      .expect({
        statusCode: 422,
        message: 'Ingredient does not exist',
        error: 'Unprocessable Entity',
      })
  })
})
