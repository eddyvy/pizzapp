import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { Ingredient } from '../../ingredient/schema/ingredient.schema'
import { PizzaSize } from '../../pizza-size/schema/pizza-size.schema'
import { Pizza } from '../../pizza/schema/pizza.schema'

export type PizzaOrderDocument = PizzaOrder & Document

@Schema()
export class PizzaOrder {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Pizza', required: true })
  pizza: Pizza

  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
  })
  extraIngredients: Ingredient[]

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PizzaSize',
    required: true,
  })
  size: PizzaSize

  @Prop({ required: true })
  price: number
}

export const PizzaOrderSchema = SchemaFactory.createForClass(PizzaOrder)
