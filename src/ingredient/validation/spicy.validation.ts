import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'

@Injectable()
export class SpicyParseToNumber implements PipeTransform {
  transform(value: unknown): any {
    const { spicyLevel, ...rest } = value as { spicyLevel: unknown } & Record<
      string,
      unknown
    >
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
    }
  }
}
