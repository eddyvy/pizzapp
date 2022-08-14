import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateIngredientDto {
  @IsString()
  @IsOptional()
  name: string

  @IsBoolean()
  @IsOptional()
  isGlutenFree: boolean

  @IsBoolean()
  @IsOptional()
  isNutFree: boolean

  @IsBoolean()
  @IsOptional()
  isLactoseFree: boolean

  @IsBoolean()
  @IsOptional()
  isFishFree: boolean

  @IsBoolean()
  @IsOptional()
  isVegetarian: boolean

  @IsBoolean()
  @IsOptional()
  isVegan: boolean

  @IsNumber()
  @IsOptional()
  spicyLevel: number

  @IsNumber()
  @IsOptional()
  extraPrice: number
}
