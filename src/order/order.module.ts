import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { IngredientModule } from '../ingredient/ingredient.module'
import { PizzaModule } from '../pizza/pizza.module'
import { PizzaSizeModule } from '../pizza-size/pizza-size.module'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { Order, OrderSchema } from './schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    IngredientModule,
    PizzaModule,
    PizzaSizeModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
