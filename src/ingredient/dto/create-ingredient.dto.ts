import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator'

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsBoolean()
  @IsDefined()
  isGlutenFree: boolean

  @IsBoolean()
  @IsDefined()
  isNutFree: boolean

  @IsBoolean()
  @IsDefined()
  isLactoseFree: boolean

  @IsBoolean()
  @IsDefined()
  isFishFree: boolean

  @IsBoolean()
  @IsDefined()
  isVegetarian: boolean

  @IsBoolean()
  @IsDefined()
  isVegan: boolean

  @IsNumber()
  @IsDefined()
  spicyLevel: number

  @IsNumber()
  @IsDefined()
  extraPrice: number
}
