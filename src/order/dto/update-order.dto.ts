import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { OrderState } from '../enum/order-state.enum'

class UpdateBankCardDto {
  @IsString()
  cardNumber: string

  @IsNumber()
  expireDate: number

  @IsString()
  secret: string
}

class UpdateCustomerDto {
  @IsString()
  name: string

  @IsString()
  email: string

  @IsString()
  phone: string

  @IsString()
  address: string

  @ValidateNested()
  @Type(() => UpdateBankCardDto)
  bankCard: UpdateBankCardDto
}

class UpdatePizzaOrderDto {
  @IsString()
  pizza: string

  @IsString({ each: true })
  @IsArray()
  extraIngredients: string[]

  @IsString()
  size: string
}

export class UpdateOrderDto {
  @ValidateNested()
  @Type(() => UpdateCustomerDto)
  @IsOptional()
  customer: UpdateCustomerDto

  @ValidateNested({ each: true })
  @Type(() => UpdatePizzaOrderDto)
  @IsOptional()
  pizzaOrders: UpdatePizzaOrderDto[]

  @IsNumber()
  @IsOptional()
  discount: number

  @IsEnum(OrderState)
  @IsOptional()
  orderState: OrderState
}
