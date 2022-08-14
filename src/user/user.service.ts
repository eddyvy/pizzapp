import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SHA256 } from 'crypto-js'
import { CreateUserDto, UpdateUserDto } from './dto'
import { User, UserDocument } from './schema/user.schema'
import { UserType } from './types/user.types'

@Injectable()
export class UserService {
  constructor(
    private config: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private mapUser(us: UserDocument): UserType {
    return {
      id: us._id.toString(),
      name: us.name,
      email: us.email,
      role: us.role,
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserType> {
    const hash = SHA256(
      this.config.getOrThrow('HASH_SALT') + createUserDto.password,
    ).toString()

    const createdUser = new this.userModel({
      name: createUserDto.name,
      email: createUserDto.email,
      hash,
      role: createUserDto.role,
    })

    const user = await createdUser.save()

    return this.mapUser(user)
  }

  async findAll(): Promise<UserType[]> {
    const users = await this.userModel.find().exec()
    return users.map(this.mapUser)
  }

  async findOne(id: string): Promise<UserType | null> {
    const user = await this.userModel.findById(id)
    if (!user) return null
    return this.mapUser(user)
  }

  async findByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<UserType | null> {
    const hash = SHA256(
      this.config.getOrThrow('HASH_SALT') + password,
    ).toString()

    const user = await this.userModel.findOne({
      email,
      hash,
    })

    if (!user) return null
    return this.mapUser(user)
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ success: boolean } | null> {
    const user = await this.userModel.findById(id)

    if (!user) return null

    const { acknowledged } = await this.userModel.updateOne(
      { _id: user._id },
      updateUserDto,
    )

    return {
      success: acknowledged,
    }
  }

  async remove(id: string): Promise<{ success: boolean } | null> {
    const user = await this.userModel.findById(id)

    if (!user) return null

    const { acknowledged } = await this.userModel.deleteOne({
      _id: user._id,
    })

    return {
      success: acknowledged,
    }
  }

  async removeAll(): Promise<{ success: boolean } | null> {
    const { acknowledged } = await this.userModel.deleteMany()
    return {
      success: acknowledged,
    }
  }
}
