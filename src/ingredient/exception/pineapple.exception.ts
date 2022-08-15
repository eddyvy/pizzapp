import { ImATeapotException } from '@nestjs/common'

export class PinneappleException extends ImATeapotException {
  constructor() {
    super('Pineapples are bad, pineapples are not your friend in a pizza!')
  }
}
