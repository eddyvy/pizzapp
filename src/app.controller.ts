import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import { CreateIngredientDto } from './ingredient/dto'
import { IngredientService } from './ingredient/ingredient.service'
import { OrderService } from './order/order.service'
import { CreatePizzaSizeDto } from './pizza-size/dto'
import { PizzaSizeService } from './pizza-size/pizza-size.service'
import { CreatePizzaDto } from './pizza/dto'
import { PizzaService } from './pizza/pizza.service'
import { UserRole } from './user/enum/user-role.enum'
import { UserService } from './user/user.service'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private userService: UserService,
    private ingredientService: IngredientService,
    private pizzaSizeService: PizzaSizeService,
    private pizzaService: PizzaService,
    private orderService: OrderService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  /**
   * Endpoint just for project purposes
   * Resets all data at the database
   */
  @Get('/fixtures')
  async fixtures() {
    await this.userService.removeAll()
    await this.ingredientService.removeAll()
    await this.pizzaSizeService.removeAll()
    await this.pizzaService.removeAll()
    await this.orderService.removeAll()

    await this.userService.create({
      email: 'admin@dormakaba.com',
      name: 'Admin Bossman',
      password: '123456',
      role: UserRole.ADMIN,
    })
    await this.userService.create({
      email: 'user@dormakaba.com',
      name: 'User Broman',
      password: '123456',
      role: UserRole.USER,
    })

    const ingredients: CreateIngredientDto[] = [
      {
        name: 'tomato',
        isGlutenFree: true,
        isNutFree: true,
        isLactoseFree: true,
        isFishFree: true,
        isVegetarian: true,
        isVegan: true,
        spicyLevel: 0,
        extraPrice: 1.5,
      },
      {
        name: 'cheese',
        isGlutenFree: true,
        isNutFree: true,
        isLactoseFree: false,
        isFishFree: true,
        isVegetarian: true,
        isVegan: true,
        spicyLevel: 0,
        extraPrice: 2,
      },
      {
        name: 'flour',
        isGlutenFree: false,
        isNutFree: true,
        isLactoseFree: true,
        isFishFree: true,
        isVegetarian: true,
        isVegan: true,
        spicyLevel: 0,
        extraPrice: 0.5,
      },
      {
        name: 'cream',
        isGlutenFree: true,
        isNutFree: true,
        isLactoseFree: false,
        isFishFree: true,
        isVegetarian: true,
        isVegan: false,
        spicyLevel: 0,
        extraPrice: 0.5,
      },
      {
        name: 'basil',
        isGlutenFree: true,
        isNutFree: true,
        isLactoseFree: true,
        isFishFree: true,
        isVegetarian: true,
        isVegan: true,
        spicyLevel: 0,
        extraPrice: 1,
      },
      {
        name: 'ham',
        isGlutenFree: true,
        isNutFree: true,
        isLactoseFree: true,
        isFishFree: true,
        isVegetarian: false,
        isVegan: false,
        spicyLevel: 0,
        extraPrice: 1,
      },
      {
        name: 'mozzarella',
        isGlutenFree: true,
        isNutFree: true,
        isLactoseFree: false,
        isFishFree: true,
        isVegetarian: true,
        isVegan: false,
        spicyLevel: 0,
        extraPrice: 1,
      },
    ]
    for (const ing of ingredients) {
      await this.ingredientService.create(ing)
    }

    const pizzaSizes: CreatePizzaSizeDto[] = [
      {
        name: 'medium',
        centimeters: 29,
        priceIncPct: 0,
      },
      {
        name: 'large',
        centimeters: 35,
        priceIncPct: 15,
      },
      {
        name: 'family',
        centimeters: 43,
        priceIncPct: 25,
      },
    ]
    for (const ps of pizzaSizes) {
      await this.pizzaSizeService.create(ps)
    }

    const pizzas: CreatePizzaDto[] = [
      {
        name: 'margarita',
        basicPrice: 12,
        ingredients: ['tomato', 'cheese'],
      },
      {
        name: 'happy',
        basicPrice: 12,
        ingredients: ['tomato', 'cheese', 'ham'],
      },
      {
        name: 'bianca',
        basicPrice: 12,
        ingredients: ['tomato', 'cheese', 'cream'],
      },
      {
        name: 'dormakaba',
        basicPrice: 12,
        ingredients: [
          'tomato',
          'cheese',
          'cream',
          'ham',
          'basil',
          'mozzarella',
        ],
      },
    ]
    for (const piz of pizzas) {
      await this.pizzaService.create(piz)
    }

    await this.orderService.create({
      pizzaOrders: [
        {
          pizza: 'dormakaba',
          extraIngredients: [],
          size: 'large',
        },
        {
          pizza: 'bianca',
          extraIngredients: ['ham', 'basil'],
          size: 'medium',
        },
      ],
      customer: {
        name: 'Aladdin',
        email: 'aladino@test.com',
        phone: '+41678123123',
        address: 'Agraba',
        bankCard: {
          cardNumber: '123456789',
          expireDate: 2660770360,
          secret: '111',
        },
      },
    })

    await this.orderService.create({
      pizzaOrders: [
        {
          pizza: 'dormakaba',
          extraIngredients: [],
          size: 'large',
        },
        {
          pizza: 'happy',
          extraIngredients: ['mozzarella', 'basil', 'ham'],
          size: 'family',
        },
        {
          pizza: 'margarita',
          extraIngredients: [],
          size: 'large',
        },
        {
          pizza: 'dormakaba',
          extraIngredients: ['ham', 'mozzarella'],
          size: 'medium',
        },
      ],
      customer: {
        name: 'Alice',
        email: 'alicwon@test.com',
        phone: '+41678999999',
        address: 'Wonderland',
        bankCard: {
          cardNumber: '987654321',
          expireDate: 2670770360,
          secret: '777',
        },
      },
    })

    return {
      success: true,
      message: 'The database has been reset and ready to use! ;)',
      adminCredentials: {
        email: 'admin@dormakaba.com',
        password: '123456',
      },
      userCredentials: {
        email: 'user@dormakaba.com',
        password: '123456',
      },
    }
  }
}
