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
import { CreatePizzaSizeDto, UpdatePizzaSizeDto } from './dto'
import { PizzaSizeService } from './pizza-size.service'
import { ParseToValidIdString } from '../mongo/validation/objectid.validation'

@Controller('sizes')
export class PizzaSizeController {
  constructor(private readonly pizzaSizeService: PizzaSizeService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() createPizzaSizeDto: CreatePizzaSizeDto) {
    return await this.pizzaSizeService.create(createPizzaSizeDto)
  }

  @Get()
  async findAll() {
    return await this.pizzaSizeService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id', ParseToValidIdString) id: string) {
    const PizzaSize = await this.pizzaSizeService.findOne(id)
    if (!PizzaSize) throw new NotFoundException()
    return PizzaSize
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id', ParseToValidIdString) id: string,
    @Body() updatePizzaSizeDto: UpdatePizzaSizeDto,
  ) {
    if (
      !updatePizzaSizeDto ||
      Array.isArray(updatePizzaSizeDto) ||
      typeof updatePizzaSizeDto !== 'object' ||
      Object.keys(updatePizzaSizeDto).length === 0
    )
      throw new BadRequestException()

    const updated = await this.pizzaSizeService.update(id, updatePizzaSizeDto)

    if (!updated)
      throw new UnprocessableEntityException('Pizza size does not exist')

    return updated
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseToValidIdString) id: string) {
    const deleted = await this.pizzaSizeService.remove(id)

    if (!deleted)
      throw new UnprocessableEntityException('Pizza size does not exist')

    return deleted
  }
}
