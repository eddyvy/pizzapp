import { IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdatePizzaSizeDto {
  @IsString()
  @IsOptional()
  name: string

  @IsNumber()
  @IsOptional()
  centimeters: number

  @IsNumber()
  @IsOptional()
  priceIncPct: number
}
