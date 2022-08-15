import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type BankCardDocument = BankCard & Document

@Schema()
export class BankCard {
  @Prop({ required: true })
  cardNumber: string

  @Prop({ required: true })
  expireDate: number

  @Prop({ required: true })
  secret: string
}

export const BankCardSchema = SchemaFactory.createForClass(BankCard)
