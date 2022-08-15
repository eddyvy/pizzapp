import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import { IngredientType } from '../types/ingredient.types'

@Injectable()
export class SpicyParseToNumberPipe implements PipeTransform {
  transform(value: unknown): IngredientType {
    if (
      !value ||
      Array.isArray(value) ||
      typeof value !== 'object' ||
      Object.keys(value).length === 0
    )
      throw new BadRequestException()

    const { spicyLevel, ...rest } = value as IngredientType

    if (spicyLevel === undefined) return value as IngredientType

    const n = Number(spicyLevel)

    if (isNaN(n))
      throw new BadRequestException(
        'Spicy level must be a number between 0 and 5',
      )

    if (n < 0)
      throw new BadRequestException('Spicy level cannot be less than 0')

    if (n > 5)
      throw new BadRequestException(
        'Spicy level cannot be more than 5, could be so dangerous!!',
      )

    return {
      ...rest,
      spicyLevel: n,
    } as IngredientType
  }
}
