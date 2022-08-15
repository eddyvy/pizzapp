import { TestingModule } from '@nestjs/testing'
import { CreatePizzaSizeDto } from '../../src/pizza-size/dto'
import { PizzaSizeModule } from '../../src/pizza-size/pizza-size.module'
import { PizzaSizeService } from '../../src/pizza-size/pizza-size.service'

export async function checkOrCreatePizzaSizes(
  moduleFixture: TestingModule,
  pizzaSizes: CreatePizzaSizeDto[],
): Promise<void> {
  const pizzaSizeService = moduleFixture
    .select(PizzaSizeModule)
    .get(PizzaSizeService)

  for (const ing of pizzaSizes) {
    const ingFromDb = await pizzaSizeService.findByName(ing.name)
    if (!ingFromDb) {
      await pizzaSizeService.create(ing)
    }
  }
}
