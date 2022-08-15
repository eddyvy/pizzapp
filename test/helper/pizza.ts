import { TestingModule } from '@nestjs/testing'
import { CreatePizzaDto } from '../../src/pizza/dto'
import { PizzaModule } from '../../src/pizza/pizza.module'
import { PizzaService } from '../../src/pizza/pizza.service'

export async function checkOrCreatePizzas(
  moduleFixture: TestingModule,
  pizzas: CreatePizzaDto[],
): Promise<void> {
  const pizzaService = moduleFixture.select(PizzaModule).get(PizzaService)

  for (const ing of pizzas) {
    const ingFromDb = await pizzaService.findByName(ing.name)
    if (!ingFromDb) {
      await pizzaService.create(ing)
    }
  }
}
