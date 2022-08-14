import * as request from 'supertest'
import { getModuleFixture } from './helper/getModuleFixture'
import { initApp } from './helper/initApp'

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
