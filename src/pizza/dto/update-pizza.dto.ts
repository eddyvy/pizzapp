import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdatePizzaDto {
  @IsString()
  @IsOptional()
  name: string

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  ingredients: string[]

  @IsNumber()
  @IsOptional()
  basicPrice: number
}
