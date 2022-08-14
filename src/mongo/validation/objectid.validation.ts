import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import { isValidObjectId } from 'mongoose'

@Injectable()
export class ParseToValidIdString implements PipeTransform {
  transform(id: unknown): string {
    if (isValidObjectId(id)) return id as string

    throw new BadRequestException('Invalid id')
  }
}
