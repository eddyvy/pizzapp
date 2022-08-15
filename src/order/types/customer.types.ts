import { BankCardType } from './bank-card.types'

export type CustomerType = {
  name: string
  email: string
  phone: string
  address: string
  bankCard: BankCardType
}
