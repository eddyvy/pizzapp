import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { Ingredient } from '../../ingredient/schema/ingredient.schema'

export type PizzaDocument = Pizza & Document

@Schema()
export class Pizza {
  @Prop({ unique: true, required: true })
  name: string

  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
  })
  ingredients: Ingredient[]

  @Prop({ required: true })
  basicPrice: number
}

export const PizzaSchema = SchemaFactory.createForClass(Pizza)
