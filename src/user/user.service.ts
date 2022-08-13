import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ReasonPhrases } from 'http-status-codes'
import { Model } from 'mongoose'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User, UserDocument } from './schema/user.schema'

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, role } = createUserDto
    const createdUser = new this.userModel({
      name,
      email,
      hash: password,
      role,
    })
    return await createdUser.save()
  }

  async findAll() {
    return await this.userModel.find().exec()
  }

  async findOne(id: string) {
    return await this.userModel.findById(id)
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.userModel.findById(id)

    if (!userToUpdate)
      throw new HttpException(
        `${ReasonPhrases.UNPROCESSABLE_ENTITY}: User does not exist`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      )

    return this.userModel.updateOne({ _id: userToUpdate._id }, updateUserDto)
  }

  async remove(id: string) {
    const userToRemove = await this.userModel.findById(id)

    if (!userToRemove)
      throw new HttpException(
        `${ReasonPhrases.UNPROCESSABLE_ENTITY}: User does not exist`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      )

    return this.userModel.deleteOne({ _id: userToRemove._id })
  }
}
