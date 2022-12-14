import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { BankCard } from './bank-card.schema'

export type CustomerDocument = Customer & Document

@Schema()
export class Customer {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  email: string

  @Prop({ required: true })
  phone: string

  @Prop({ required: true })
  address: string

  @Prop({ type: BankCard, required: true })
  bankCard: BankCard
}

export const CustomerSchema = SchemaFactory.createForClass(Customer)
