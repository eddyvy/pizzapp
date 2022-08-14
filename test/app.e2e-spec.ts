import * as request from 'supertest'
import { getModuleFixture, initApp } from './helper'

describe('AppController (e2e)', () => {
  test('GET /', async () => {
    const app = await initApp(await getModuleFixture())

    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello Pizzapp!')

    await app.close()
  })
})
