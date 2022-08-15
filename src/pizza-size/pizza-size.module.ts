import { Module } from '@nestjs/common'
import { PizzaSizeService } from './pizza-size.service'
import { PizzaSizeController } from './pizza-size.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { PizzaSize, PizzaSizeSchema } from './schema/pizza-size.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PizzaSize.name, schema: PizzaSizeSchema },
    ]),
  ],
  controllers: [PizzaSizeController],
  providers: [PizzaSizeService],
  exports: [PizzaSizeService],
})
export class PizzaSizeModule {}
