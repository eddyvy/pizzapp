import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Customer } from './customer.schema'
import { PizzaOrder, PizzaOrderSchema } from './pizza-order.schema'

export type OrderDocument = Order & Document

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, type: Customer })
  customer: Customer

  @Prop({ required: true, type: [{ type: PizzaOrderSchema }] })
  pizzaOrders: PizzaOrder[]

  @Prop({ required: true, default: 0 })
  discount: number

  @Prop({ required: true })
  price: number

  @Prop({ required: true, isInteger: true })
  state: number
}

export const OrderSchema = SchemaFactory.createForClass(Order)
