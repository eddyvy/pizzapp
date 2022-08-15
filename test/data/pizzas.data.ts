import { CreatePizzaDto } from '../../src/pizza/dto'

export const testDataPizzas: CreatePizzaDto[] = [
  {
    name: 'margarita',
    basicPrice: 12,
    ingredients: ['tomato', 'cheese'],
  },
  {
    name: 'hampizza',
    basicPrice: 12,
    ingredients: ['tomato', 'cheese', 'ham'],
  },
  {
    name: 'creampizza',
    basicPrice: 12,
    ingredients: ['tomato', 'cheese', 'cream'],
  },
  {
    name: 'superpizza',
    basicPrice: 12,
    ingredients: ['tomato', 'cheese', 'cream', 'ham', 'basil', 'mozzarella'],
  },
]
