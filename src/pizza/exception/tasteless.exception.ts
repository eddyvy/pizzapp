import { BadRequestException } from '@nestjs/common'

export class TastelessException extends BadRequestException {
  constructor() {
    super('Your pizza without ingredients is so tasteless!')
  }
}
