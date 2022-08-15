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
import { CreateIngredientDto, UpdateIngredientDto } from './dto'
import { IngredientService } from './ingredient.service'
import { ParseToValidIdString } from '../mongo/validation/objectid.validation'
import { SpicyParseToNumber } from './validation/spicy.validation'

@Controller('ingredients')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(
    @Body(SpicyParseToNumber) createIngredientDto: CreateIngredientDto,
  ) {
    return await this.ingredientService.create(createIngredientDto)
  }

  @Get()
  async findAll() {
    return await this.ingredientService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id', ParseToValidIdString) id: string) {
    const ingredient = await this.ingredientService.findOne(id)
    if (!ingredient) throw new NotFoundException()
    return ingredient
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id', ParseToValidIdString) id: string,
    @Body(SpicyParseToNumber) updateIngredientDto: UpdateIngredientDto,
  ) {
    if (
      !updateIngredientDto ||
      Array.isArray(updateIngredientDto) ||
      typeof updateIngredientDto !== 'object' ||
      Object.keys(updateIngredientDto).length === 0
    )
      throw new BadRequestException()

    const updated = await this.ingredientService.update(id, updateIngredientDto)

    if (!updated)
      throw new UnprocessableEntityException('Ingredient does not exist')

    return updated
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseToValidIdString) id: string) {
    const deleted = await this.ingredientService.remove(id)

    if (!deleted)
      throw new UnprocessableEntityException('Ingredient does not exist')

    return deleted
  }
}
