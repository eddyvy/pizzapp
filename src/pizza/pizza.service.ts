import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { IngredientDocument } from '../ingredient/schema/ingredient.schema'
import { IngredientService } from '../ingredient/ingredient.service'
import { CreatePizzaDto, UpdatePizzaDto } from './dto'
import { Pizza, PizzaDocument } from './schema/pizza.schema'
import { PizzaType } from './types/pizza.types'

@Injectable()
export class PizzaService {
  constructor(
    @InjectModel(Pizza.name)
    private pizzaModel: Model<PizzaDocument>,
    private ingredientService: IngredientService,
  ) {}

  readonly POPULATE_STR = 'ingredients'

  private mapPizza(pi: PizzaDocument): PizzaType {
    return {
      id: pi._id.toString(),
      name: pi.name,
      ingredients: pi.ingredients.map((ing) => ing.name),
      basicPrice: pi.basicPrice,
    }
  }

  private async getIngredientsFromNames(
    ingredientNames: string[],
    throwIfMissingSomething = true,
  ): Promise<IngredientDocument[]> {
    return (
      await Promise.all(
        ingredientNames.map(async (ing) => {
          const ingFromDb = await this.ingredientService.findByNameAsDb(ing)
          if (!ingFromDb && throwIfMissingSomething)
            throw new UnprocessableEntityException(
              `It seems you've tried to create a pizza with ${ing}... sounds weird for us!`,
            )
          return ingFromDb
        }),
      )
    ).filter((i) => !!i)
  }

  async create(createPizzaDto: CreatePizzaDto): Promise<PizzaType> {
    const createdPizza = new this.pizzaModel({
      name: createPizzaDto.name,
      basicPrice: createPizzaDto.basicPrice,
      ingredients: await this.getIngredientsFromNames(
        createPizzaDto.ingredients,
      ),
    })
    const pz = await createdPizza.save()
    return this.mapPizza(pz)
  }

  async findAll(): Promise<PizzaType[]> {
    const pizs = await this.pizzaModel.find().populate(this.POPULATE_STR).exec()
    return pizs.map(this.mapPizza)
  }

  async findOne(id: string): Promise<PizzaType | null> {
    const piz = await this.pizzaModel.findById(id).populate(this.POPULATE_STR)
    if (!piz) return null
    return this.mapPizza(piz)
  }

  async findByName(nameToFind: string): Promise<PizzaType | null> {
    const piz = await this.pizzaModel
      .findOne({
        name: nameToFind,
      })
      .populate(this.POPULATE_STR)
    if (!piz) return null
    return this.mapPizza(piz)
  }

  async findManyByIngredients(
    ingredientsToFind: string[],
  ): Promise<PizzaType[]> {
    const ingFromDb = await this.getIngredientsFromNames(
      ingredientsToFind,
      false,
    )
    const pizs = await this.pizzaModel
      .find({
        ingredients: { $all: ingFromDb },
      })
      .populate(this.POPULATE_STR)
      .exec()

    return pizs.map(this.mapPizza)
  }

  async update(
    id: string,
    updatePizzaDto: UpdatePizzaDto,
  ): Promise<{ success: boolean } | null> {
    const piz = await this.pizzaModel.findById(id)

    if (!piz) return null

    const { ingredients, ...rest } = updatePizzaDto

    const ingFromDb = ingredients
      ? await this.getIngredientsFromNames(ingredients)
      : ingredients

    const updatePizzaMapped = ingredients
      ? { ...rest, ingredients: ingFromDb }
      : UpdatePizzaDto

    const { acknowledged } = await this.pizzaModel.updateOne(
      { _id: piz._id },
      updatePizzaMapped,
    )

    return {
      success: acknowledged,
    }
  }

  async remove(id: string): Promise<{ success: boolean } | null> {
    const piz = await this.pizzaModel.findById(id)

    if (!piz) return null

    const { acknowledged } = await this.pizzaModel.deleteOne({
      _id: piz._id,
    })

    return {
      success: acknowledged,
    }
  }

  async removeAll(): Promise<{ success: boolean } | null> {
    const { acknowledged } = await this.pizzaModel.deleteMany()
    return {
      success: acknowledged,
    }
  }
}
