import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator'

export class CreatePizzaDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString({ each: true })
  @IsArray()
  @IsDefined()
  ingredients: string[]

  @IsNumber()
  @IsDefined()
  basicPrice: number
}
