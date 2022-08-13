import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SHA256 } from 'crypto-js'
import { CreateUserDto, GetUserDto, UpdateUserDto } from './dto'
import { User, UserDocument } from './schema/user.schema'

@Injectable()
export class UserService {
  constructor(
    private config: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<GetUserDto> {
    const hash = SHA256(
      this.config.get('HASH_SALT') + createUserDto.password,
    ).toString()

    const createdUser = new this.userModel({
      name: createUserDto.name,
      email: createUserDto.email,
      hash,
      role: createUserDto.role,
    })

    const { _id, name, email, role } = await createdUser.save()

    return {
      id: _id,
      name,
      email,
      role,
    }
  }

  async findAll(): Promise<GetUserDto[]> {
    const usersFound = await this.userModel.find().exec()
    return usersFound.map(({ _id, name, email, role }) => ({
      id: _id,
      name,
      email,
      role,
    }))
  }

  async findOne(id: string): Promise<GetUserDto | null> {
    const userFound = await this.userModel.findById(id)

    if (!userFound) return null

    return {
      id: userFound._id,
      name: userFound.name,
      email: userFound.email,
      role: userFound.role,
    }
  }

  async findByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<GetUserDto | null> {
    const hash = SHA256(this.config.get('HASH_SALT') + password).toString()

    const userFound = await this.userModel.findOne({
      email,
      hash,
    })

    if (!userFound) return null

    return {
      id: userFound._id,
      name: userFound.name,
      email: userFound.email,
      role: userFound.role,
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ success: boolean } | null> {
    const userToUpdate = await this.userModel.findById(id)

    if (!userToUpdate) return null

    const { acknowledged } = await this.userModel.updateOne(
      { _id: userToUpdate._id },
      updateUserDto,
    )

    return {
      success: acknowledged,
    }
  }

  async remove(id: string): Promise<{ success: boolean } | null> {
    const userToRemove = await this.userModel.findById(id)

    if (!userToRemove) return null

    const { acknowledged } = await this.userModel.deleteOne({
      _id: userToRemove._id,
    })

    return {
      success: acknowledged,
    }
  }
}
