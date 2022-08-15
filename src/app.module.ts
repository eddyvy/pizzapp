import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER } from '@nestjs/core'
import { MongooseModule } from '@nestjs/mongoose'
import { AppController } from './app.controller'
import { AllExceptionsFilter } from './app.filter'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { IngredientModule } from './ingredient/ingredient.module'
import { PizzaSizeModule } from './pizza-size/pizza-size.module'
import { PizzaModule } from './pizza/pizza.module'
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get('MONGO_HOST'),
        dbName: config.get('MONGO_INITDB_DATABASE'),
        user: config.get('MONGO_INITDB_ROOT_USERNAME'),
        pass: config.get('MONGO_INITDB_ROOT_PASSWORD'),
        retryAttempts: 2,
      }),
    }),
    UserModule,
    IngredientModule,
    PizzaSizeModule,
    PizzaModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
