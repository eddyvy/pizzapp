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
} from '@nestjs/common'
import { JwtGuard, RolesGuard } from '../auth/guard'
import { Roles } from '../auth/decorator'
import { CreateIngredientDto, UpdateIngredientDto } from './dto'
import { IngredientService } from './ingredient.service'
import { ParseToValidIdStringPipe } from '../mongo/pipe/objectid.validation'
import { SpicyParseToNumberPipe } from './pipe/spicy.pipe'

@Controller('ingredients')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(
    @Body(SpicyParseToNumberPipe) createIngredientDto: CreateIngredientDto,
  ) {
    return await this.ingredientService.create(createIngredientDto)
  }

  @Get()
  async findAll() {
    return await this.ingredientService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id', ParseToValidIdStringPipe) id: string) {
    const ingredient = await this.ingredientService.findOne(id)
    if (!ingredient) throw new NotFoundException()
    return ingredient
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id', ParseToValidIdStringPipe) id: string,
    @Body(SpicyParseToNumberPipe) updateIngredientDto: UpdateIngredientDto,
  ) {
    const updated = await this.ingredientService.update(id, updateIngredientDto)

    if (!updated)
      throw new UnprocessableEntityException('Ingredient does not exist')

    return updated
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseToValidIdStringPipe) id: string) {
    const deleted = await this.ingredientService.remove(id)

    if (!deleted)
      throw new UnprocessableEntityException('Ingredient does not exist')

    return deleted
  }
}
