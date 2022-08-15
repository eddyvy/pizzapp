import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type PizzaSizeDocument = PizzaSize & Document

@Schema()
export class PizzaSize {
  @Prop({ unique: true, required: true })
  name: string

  @Prop({ unique: true, required: true })
  centimeters: number

  @Prop({ required: true })
  priceIncPct: number
}

export const PizzaSizeSchema = SchemaFactory.createForClass(PizzaSize)
