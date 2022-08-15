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
import { PizzaSizeModule } from '../../../src/pizza-size/pizza-size.module'
import { PizzaSizeService } from '../../../src/pizza-size/pizza-size.service'

describe('PATCH /sizes/:id', () => {
  const url = '/sizes'
  let app: INestApplication
  let userService: UserService
  let pizzaSizeService: PizzaSizeService

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

    const pizzaSizeToUpdate = await pizzaSizeService.create({
      name: `pizzaSize${now}`,
      centimeters: now,
      priceIncPct: 0,
    })

    await request(app.getHttpServer())
      .patch(`${url}/${pizzaSizeToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        centimeters: now + 1,
        priceIncPct: 10,
      })
      .expect(200)
      .expect({
        success: true,
      })

    const updatedpizzaSize = await pizzaSizeService.findOne(
      pizzaSizeToUpdate.id,
    )

    expect(updatedpizzaSize).toMatchObject({
      id: expect.any(String),
      name: `pizzaSize${now}`,
      centimeters: now + 1,
      priceIncPct: 10,
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
        centimeters: 10,
        priceIncPct: 10,
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

    const pizzaSizeToUpdate = await pizzaSizeService.create({
      name: `pizzaSize${now}`,
      centimeters: now,
      priceIncPct: 0,
    })

    await request(app.getHttpServer())
      .patch(`${url}/${pizzaSizeToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: 1000,
        centimeters: 'wrong',
        priceIncPct: ['wrong', 'price'],
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'name must be a string',
          'centimeters must be a number conforming to the specified constraints',
          'priceIncPct must be a number conforming to the specified constraints',
        ],
        error: 'Bad Request',
      })

    await request(app.getHttpServer())
      .patch(`${url}/${pizzaSizeToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Bad Request',
      })
  })

  test('should return 403 if is not an admin user', async () => {
    const now = Date.now().valueOf()
    const me: UserType = await userService.findByEmailAndPassword(
      notAdminUser.email,
      notAdminUser.password,
    )
    const myToken = createToken(me)

    const pizzaSizeToUpdate = await pizzaSizeService.create({
      name: `pizzaSize${now}`,
      centimeters: now,
      priceIncPct: 0,
    })

    await request(app.getHttpServer())
      .patch(`${url}/${pizzaSizeToUpdate.id}`)
      .set('Authorization', `Bearer ${myToken}`)
      .send({
        name: `pizzaSize${now + 1}`,
        centimeters: now + 1,
        priceIncPct: 100,
      })
      .expect(403)
      .expect({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      })
  })

  test('should return 422 if the pizzaSize does not exist', async () => {
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
        priceIncPct: 100,
      })
      .expect(422)
      .expect({
        statusCode: 422,
        message: 'Pizza size does not exist',
        error: 'Unprocessable Entity',
      })
  })
})
