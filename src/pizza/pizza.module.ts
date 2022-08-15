import { Module } from '@nestjs/common'
import { IngredientModule } from '../ingredient/ingredient.module'
import { PizzaService } from './pizza.service'
import { PizzaController } from './pizza.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Pizza, PizzaSchema } from './schema/pizza.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pizza.name, schema: PizzaSchema }]),
    IngredientModule,
  ],
  controllers: [PizzaController],
  providers: [PizzaService],
  exports: [PizzaService],
})
export class PizzaModule {}
