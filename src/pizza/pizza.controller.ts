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
  Query,
  ParseArrayPipe,
  DefaultValuePipe,
} from '@nestjs/common'
import { JwtGuard, RolesGuard } from '../auth/guard'
import { Roles } from '../auth/decorator'
import { CreatePizzaDto, UpdatePizzaDto } from './dto'
import { PizzaService } from './pizza.service'
import { ParseToValidIdStringPipe } from '../mongo/pipe/objectid.validation'
import { TastelessException } from './exception/tasteless.exception'

@Controller('pizzas')
export class PizzaController {
  constructor(private readonly pizzaService: PizzaService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() createPizzaDto: CreatePizzaDto) {
    if (createPizzaDto.ingredients.length === 0) throw new TastelessException()

    return await this.pizzaService.create(createPizzaDto)
  }

  @Get()
  async findAll(
    @Query('ingredients', new DefaultValuePipe([]), ParseArrayPipe)
    ingredients: string[],
  ) {
    return ingredients.length === 0
      ? await this.pizzaService.findAll()
      : await this.pizzaService.findManyByIngredients(ingredients)
  }

  @Get(':id')
  async findOne(@Param('id', ParseToValidIdStringPipe) id: string) {
    const Pizza = await this.pizzaService.findOne(id)
    if (!Pizza) throw new NotFoundException()
    return Pizza
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id', ParseToValidIdStringPipe) id: string,
    @Body() updatePizzaDto: UpdatePizzaDto,
  ) {
    if (updatePizzaDto.ingredients.length === 0) throw new TastelessException()

    const updated = await this.pizzaService.update(id, updatePizzaDto)

    if (!updated) throw new UnprocessableEntityException('Pizza does not exist')

    return updated
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseToValidIdStringPipe) id: string) {
    const deleted = await this.pizzaService.remove(id)

    if (!deleted) throw new UnprocessableEntityException('Pizza does not exist')

    return deleted
  }
}
