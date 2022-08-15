import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreatePizzaSizeDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsNumber()
  @IsDefined()
  centimeters: number

  @IsNumber()
  @IsDefined()
  priceIncPct: number
}
