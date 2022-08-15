import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { PizzaSizeDocument } from 'src/pizza-size/schema/pizza-size.schema'
import { IngredientDocument } from '../ingredient/schema/ingredient.schema'
import { PizzaSizeService } from '../pizza-size/pizza-size.service'
import { PizzaService } from '../pizza/pizza.service'
import { PizzaDocument } from '../pizza/schema/pizza.schema'
import { CreateOrderDto, CreatePizzaOrderDto, UpdateOrderDto } from './dto'
import { OrderState } from './enum/order-state.enum'
import { PizzaOrder, Order, OrderDocument } from './schema'
import { OrderType } from './types/order.types'

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    private pizzaService: PizzaService,
    private pizzaSizeService: PizzaSizeService,
  ) {}

  readonly POPULATE_STR =
    'customer pizzaOrders pizzaOrders.pizza pizzaOrders.extraIngredients pizzaOrders.size'

  private mapOrder(ord: OrderDocument): OrderType {
    const cus = ord.customer
    return {
      id: ord._id.toString(),
      customer: {
        name: cus.name,
        email: cus.email,
        phone: cus.phone,
        address: cus.address,
        bankCard: {
          cardNumber: cus.bankCard.cardNumber,
          expireDate: cus.bankCard.expireDate,
          secret: cus.bankCard.secret,
        },
      },
      pizzaOrders: ord.pizzaOrders.map((pizOrd) => ({
        pizza: pizOrd.pizza.name,
        extraIngredients: pizOrd.extraIngredients.map((i) => i.name),
        size: pizOrd.size.name,
        price: pizOrd.price,
      })),
      discount: ord.discount,
      price: ord.price,
      state: ord.state,
    }
  }

  private calculatePizzaOrderPrice(
    ingredients: IngredientDocument[],
    pizza: PizzaDocument,
    size: PizzaSizeDocument,
  ): number {
    return (
      (ingredients.map((i) => i.extraPrice).reduce((a, b) => a + b, 0) +
        pizza.basicPrice) *
      (1 + size.priceIncPct / 100)
    )
  }

  private async getPizzaOrdersForDb(
    createPizzaOrderDtos: CreatePizzaOrderDto[],
  ): Promise<PizzaOrder[]> {
    return Promise.all(
      createPizzaOrderDtos.map(async (pizOrd): Promise<PizzaOrder> => {
        const extraIngredients =
          await this.pizzaService.getIngredientsFromNames(
            pizOrd.extraIngredients,
          )

        const pizza = await this.pizzaService.findByNameAsDb(pizOrd.pizza)

        if (!pizza)
          throw new UnprocessableEntityException(
            `Sorry, we don't have the pizza named '${pizOrd.pizza}', but would be a nice name for a pizza!`,
          )

        const size = await this.pizzaSizeService.findByNameAsDb(pizOrd.size)

        if (!size)
          throw new UnprocessableEntityException(
            `Sorry, we don't have pizzas with size '${pizOrd.size}'`,
          )

        const price = this.calculatePizzaOrderPrice(
          extraIngredients,
          pizza,
          size,
        )

        return {
          pizza,
          extraIngredients,
          size,
          price,
        }
      }),
    )
  }

  async create(createOrderDto: CreateOrderDto): Promise<OrderType> {
    const pizzaOrders = await this.getPizzaOrdersForDb(
      createOrderDto.pizzaOrders,
    )

    const price = pizzaOrders.map((o) => o.price).reduce((a, b) => a + b, 0)

    const createdOrder = new this.orderModel({
      customer: createOrderDto.customer,
      pizzaOrders: pizzaOrders,
      discount: 0,
      price,
      state: OrderState.RECEIVED,
    })
    const ord = await createdOrder.save()
    return this.mapOrder(ord)
  }

  async findAll(): Promise<OrderType[]> {
    const ords = await this.orderModel.find().populate(this.POPULATE_STR).exec()
    return ords.map(this.mapOrder)
  }

  async findOne(id: string): Promise<OrderType | null> {
    const ord = await this.orderModel.findById(id).populate(this.POPULATE_STR)
    if (!ord) return null
    return this.mapOrder(ord)
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<{ success: boolean } | null> {
    const ord = await this.orderModel.findById(id).populate(this.POPULATE_STR)

    if (!ord) return null

    const { pizzaOrders, ...rest } = updateOrderDto

    const pizOrds = pizzaOrders
      ? await this.getPizzaOrdersForDb(pizzaOrders)
      : pizzaOrders

    const discFactor = updateOrderDto.discount
      ? 1 - updateOrderDto.discount / 100
      : 1

    const price =
      pizOrds.map((o) => o.price).reduce((a, b) => a + b, 0) * discFactor

    const updateOrderForDb = pizzaOrders
      ? { ...rest, pizzaOrders: pizOrds, price }
      : updateOrderDto

    const { acknowledged } = await this.orderModel.updateOne(
      { _id: ord._id },
      updateOrderForDb,
    )

    return {
      success: acknowledged,
    }
  }

  async remove(id: string): Promise<{ success: boolean } | null> {
    const ord = await this.orderModel.findById(id).populate(this.POPULATE_STR)

    if (!ord) return null

    const { acknowledged } = await this.orderModel.deleteOne({
      _id: ord._id,
    })

    return {
      success: acknowledged,
    }
  }

  async removeAll(): Promise<{ success: boolean } | null> {
    const { acknowledged } = await this.orderModel.deleteMany()
    return {
      success: acknowledged,
    }
  }
}
