import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreatePizzaSizeDto, UpdatePizzaSizeDto } from './dto'
import { PizzaSize, PizzaSizeDocument } from './schema/pizza-size.schema'
import { PizzaSizeType } from './types/pizza-size.types'

@Injectable()
export class PizzaSizeService {
  constructor(
    @InjectModel(PizzaSize.name)
    private pizzaSizeModel: Model<PizzaSizeDocument>,
  ) {}

  private mapPizzaSize(ps: PizzaSizeDocument): PizzaSizeType {
    return {
      id: ps._id.toString(),
      name: ps.name,
      centimeters: ps.centimeters,
      priceIncPct: ps.priceIncPct,
    }
  }

  async create(createPizzaSizeDto: CreatePizzaSizeDto): Promise<PizzaSizeType> {
    const createdPizzaSize = new this.pizzaSizeModel(createPizzaSizeDto)
    const ing = await createdPizzaSize.save()
    return this.mapPizzaSize(ing)
  }

  async findAll(): Promise<PizzaSizeType[]> {
    const pss = await this.pizzaSizeModel.find().exec()
    return pss.map(this.mapPizzaSize)
  }

  async findOne(id: string): Promise<PizzaSizeType | null> {
    const ps = await this.pizzaSizeModel.findById(id)
    if (!ps) return null
    return this.mapPizzaSize(ps)
  }

  async findByName(nameToFind: string): Promise<PizzaSizeType | null> {
    const ps = await this.pizzaSizeModel.findOne({
      name: nameToFind,
    })
    if (!ps) return null
    return this.mapPizzaSize(ps)
  }

  async findBySize(sizeToFind: number): Promise<PizzaSizeType | null> {
    const ps = await this.pizzaSizeModel.findOne({
      centimeters: sizeToFind,
    })
    if (!ps) return null
    return this.mapPizzaSize(ps)
  }

  async update(
    id: string,
    updatePizzaSizeDto: UpdatePizzaSizeDto,
  ): Promise<{ success: boolean } | null> {
    const ps = await this.pizzaSizeModel.findById(id)

    if (!ps) return null

    const { acknowledged } = await this.pizzaSizeModel.updateOne(
      { _id: ps._id },
      updatePizzaSizeDto,
    )

    return {
      success: acknowledged,
    }
  }

  async remove(id: string): Promise<{ success: boolean } | null> {
    const ps = await this.pizzaSizeModel.findById(id)

    if (!ps) return null

    const { acknowledged } = await this.pizzaSizeModel.deleteOne({
      _id: ps._id,
    })

    return {
      success: acknowledged,
    }
  }

  async removeAll(): Promise<{ success: boolean } | null> {
    const { acknowledged } = await this.pizzaSizeModel.deleteMany()
    return {
      success: acknowledged,
    }
  }
}
