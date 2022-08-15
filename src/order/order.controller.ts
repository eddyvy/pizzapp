import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UnprocessableEntityException,
  UseGuards,
  BadRequestException,
} from '@nestjs/common'
import { JwtGuard, RolesGuard } from '../auth/guard'
import { Roles } from '../auth/decorator'
import { CreateOrderDto, UpdateOrderDto } from './dto'
import { OrderService } from './order.service'
import { ParseToValidIdStringPipe } from '../mongo/pipe/objectid.validation'

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.orderService.create(createOrderDto)
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return await this.orderService.findAll()
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id', ParseToValidIdStringPipe) id: string) {
    const ord = await this.orderService.findOne(id)
    if (!ord) throw new NotFoundException()
    return ord
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id', ParseToValidIdStringPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    if (
      !updateOrderDto ||
      Array.isArray(updateOrderDto) ||
      typeof updateOrderDto !== 'object' ||
      Object.keys(updateOrderDto).length === 0
    )
      throw new BadRequestException()

    const updated = await this.orderService.update(id, updateOrderDto)

    if (!updated) throw new UnprocessableEntityException('Order does not exist')

    return updated
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseToValidIdStringPipe) id: string) {
    const deleted = await this.orderService.remove(id)

    if (!deleted) throw new UnprocessableEntityException('Order does not exist')

    return deleted
  }
}
