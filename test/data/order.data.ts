import { CreateOrderDto } from '../../src/order/dto'

export const testDataOrder: CreateOrderDto = {
  pizzaOrders: [
    {
      pizza: 'margarita',
      extraIngredients: ['ham', 'basil'],
      size: 'medium',
    },
    {
      pizza: 'hampizza',
      extraIngredients: [],
      size: 'large',
    },
  ],
  customer: {
    name: 'John',
    email: 'johndoe@test.com',
    phone: '+41678123123',
    address: 'St. Misterious',
    bankCard: {
      cardNumber: '123456789',
      expireDate: 2660570360,
      secret: '111',
    },
  },
}

export const testDataOrder2: CreateOrderDto = {
  pizzaOrders: [
    {
      pizza: 'superpizza',
      extraIngredients: [],
      size: 'large',
    },
    {
      pizza: 'creampizza',
      extraIngredients: ['ham', 'basil'],
      size: 'medium',
    },
  ],
  customer: {
    name: 'Tom',
    email: 'tomdoe@test.com',
    phone: '+41678123123',
    address: 'St. Test',
    bankCard: {
      cardNumber: '123456789',
      expireDate: 2660770360,
      secret: '111',
    },
  },
}
