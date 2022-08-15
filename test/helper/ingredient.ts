import { TestingModule } from '@nestjs/testing'
import { CreateIngredientDto } from '../../src/ingredient/dto'
import { IngredientModule } from '../../src/ingredient/ingredient.module'
import { IngredientService } from '../../src/ingredient/ingredient.service'

export async function chekOrCreateIngredients(
  moduleFixture: TestingModule,
  ingredients: CreateIngredientDto[],
): Promise<void> {
  const ingredientService = moduleFixture
    .select(IngredientModule)
    .get(IngredientService)

  for (const ing of ingredients) {
    const ingFromDb = await ingredientService.findByName(ing.name)
    if (!ingFromDb) {
      await ingredientService.create(ing)
    }
  }
}
