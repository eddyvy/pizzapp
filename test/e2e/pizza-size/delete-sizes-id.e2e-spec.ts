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
import { PizzaSizeModule } from '../../../src/pizza-size/pizza-size.module'
import { PizzaSizeService } from '../../../src/pizza-size/pizza-size.service'

describe('DELETE /sizes/:id', () => {
  const url = '/sizes'
  let app: INestApplication
  let userService: UserService
  let pizzaSizeService: PizzaSizeService

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

    pizzaSizeService = moduleFixture
      .select(PizzaSizeModule)
      .get(PizzaSizeService)
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

    const pizzaSizeToDelete = await pizzaSizeService.create({
      name: `pizzaSize${now}`,
      centimeters: now,
      priceIncPct: 25,
    })

    await request(app.getHttpServer())
      .delete(`${url}/${pizzaSizeToDelete.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(200)
      .expect({
        success: true,
      })

    const deletedPizzaSize = await pizzaSizeService.findOne(
      pizzaSizeToDelete.id,
    )

    expect(deletedPizzaSize).toBeNull()
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

    const pizzaSizeToDelete = await pizzaSizeService.create({
      name: `pizzaSize${now}`,
      centimeters: 35,
      priceIncPct: 25,
    })

    await request(app.getHttpServer())
      .delete(`${url}/${pizzaSizeToDelete.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(403)
      .expect({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      })
  })

  test('should return 422 if the pizza size does not exist', async () => {
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
        message: 'Pizza size does not exist',
        error: 'Unprocessable Entity',
      })
  })
})
