import { Catch, ArgumentsHost, ConflictException } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { MongoError } from 'mongodb'

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof MongoError) {
      switch (exception.code) {
        case 11000:
          const catchedExc = new ConflictException('Resource already exists')
          super.catch(catchedExc, host)
          return
      }
    }

    super.catch(exception, host)
  }
}
