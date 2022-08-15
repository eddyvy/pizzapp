import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateIngredientDto, UpdateIngredientDto } from './dto'
import { Ingredient, IngredientDocument } from './schema/ingredient.schema'
import { IngredientType } from './types/ingredient.types'

@Injectable()
export class IngredientService {
  constructor(
    @InjectModel(Ingredient.name)
    private ingredientModel: Model<IngredientDocument>,
  ) {}

  private mapIngredient(ing: IngredientDocument): IngredientType {
    return {
      id: ing._id.toString(),
      name: ing.name,
      isGlutenFree: ing.isGlutenFree,
      isNutFree: ing.isNutFree,
      isLactoseFree: ing.isLactoseFree,
      isFishFree: ing.isFishFree,
      isVegetarian: ing.isVegetarian,
      isVegan: ing.isVegan,
      spicyLevel: ing.spicyLevel,
      extraPrice: ing.extraPrice,
    }
  }

  async create(
    createIngredientDto: CreateIngredientDto,
  ): Promise<IngredientType> {
    const createdIngredient = new this.ingredientModel(createIngredientDto)
    const ing = await createdIngredient.save()
    return this.mapIngredient(ing)
  }

  async findAll(): Promise<IngredientType[]> {
    const ings = await this.ingredientModel.find().exec()
    return ings.map(this.mapIngredient)
  }

  async findOne(id: string): Promise<IngredientType | null> {
    const ing = await this.ingredientModel.findById(id)
    if (!ing) return null
    return this.mapIngredient(ing)
  }

  async findByName(nameToFind: string): Promise<IngredientType | null> {
    const ing = await this.ingredientModel.findOne({
      name: nameToFind,
    })
    if (!ing) return null
    return this.mapIngredient(ing)
  }

  async findByNameAsDb(nameToFind: string): Promise<IngredientDocument | null> {
    const ing = await this.ingredientModel.findOne({
      name: nameToFind,
    })
    if (!ing) return null
    return ing
  }

  async update(
    id: string,
    updateIngredientDto: UpdateIngredientDto,
  ): Promise<{ success: boolean } | null> {
    const ing = await this.ingredientModel.findById(id)

    if (!ing) return null

    const { acknowledged } = await this.ingredientModel.updateOne(
      { _id: ing._id },
      updateIngredientDto,
    )

    return {
      success: acknowledged,
    }
  }

  async remove(id: string): Promise<{ success: boolean } | null> {
    const ing = await this.ingredientModel.findById(id)

    if (!ing) return null

    const { acknowledged } = await this.ingredientModel.deleteOne({
      _id: ing._id,
    })

    return {
      success: acknowledged,
    }
  }

  async removeAll(): Promise<{ success: boolean } | null> {
    const { acknowledged } = await this.ingredientModel.deleteMany()
    return {
      success: acknowledged,
    }
  }
}
