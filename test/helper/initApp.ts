import { TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'

export async function initApp(
  moduleFixture: TestingModule,
): Promise<INestApplication> {
  const app = moduleFixture.createNestApplication()
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )
  await app.init()
  return app
}
