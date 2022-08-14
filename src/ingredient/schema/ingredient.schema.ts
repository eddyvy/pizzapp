import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type IngredientDocument = Ingredient & Document

@Schema()
export class Ingredient {
  @Prop({ unique: true, required: true })
  name: string

  @Prop({ required: true })
  isGlutenFree: boolean

  @Prop({ required: true })
  isNutFree: boolean

  @Prop({ required: true })
  isLactoseFree: boolean

  @Prop({ required: true })
  isFishFree: boolean

  @Prop({ required: true })
  isVegetarian: boolean

  @Prop({ required: true })
  isVegan: boolean

  @Prop({ required: true, min: 0, max: 5 })
  spicyLevel: number

  @Prop({ required: true })
  extraPrice: number
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient)
