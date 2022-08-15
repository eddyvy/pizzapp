import { OrderState } from '../enum/order-state.enum'
import { CustomerType } from './customer.types'
import { PizzaOrderType } from './pizza-order.types'

export type OrderType = {
  id: string
  customer: CustomerType
  pizzaOrders: PizzaOrderType[]
  discount: number
  price: number
  state: OrderState
}
