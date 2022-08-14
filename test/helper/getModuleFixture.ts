import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { AppModule } from '../../src/app.module'

export async function getModuleFixture() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ConfigModule)
    .useValue(
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.test.env',
      }),
    )
    .compile()

  return moduleFixture
}
