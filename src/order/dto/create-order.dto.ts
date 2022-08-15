import { Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator'

export class CreateBankCardDto {
  @IsString()
  @IsNotEmpty()
  cardNumber: string

  @IsNumber()
  @IsDefined()
  expireDate: number

  @IsString()
  @IsNotEmpty()
  secret: string
}

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  phone: string

  @IsString()
  @IsNotEmpty()
  address: string

  @ValidateNested()
  @Type(() => CreateBankCardDto)
  @IsDefined()
  bankCard: CreateBankCardDto
}

export class CreatePizzaOrderDto {
  @IsString()
  @IsDefined()
  pizza: string

  @IsString({ each: true })
  @IsArray()
  @IsDefined()
  extraIngredients: string[]

  @IsString()
  @IsDefined()
  size: string
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  @IsDefined()
  customer: CreateCustomerDto

  @ValidateNested({ each: true })
  @Type(() => CreatePizzaOrderDto)
  @IsDefined()
  pizzaOrders: CreatePizzaOrderDto[]
}
