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
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtGuard } from '../auth/guard/jwt.guard'
import { JwtPayload } from '../auth/decorator/jwt.decorator'
import { JwtPayloadType } from '../auth/types/jwt.types'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto)
  }

  @UseGuards(JwtGuard)
  @Get('/me')
  async findMe(@JwtPayload() payload: JwtPayloadType) {
    return { payload }
  }

  @UseGuards(JwtGuard)
  @Get()
  async findAll() {
    return await this.userService.findAll()
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id)

    if (!user) throw new NotFoundException()

    return user
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updated = await this.userService.update(id, updateUserDto)

    if (!updated) throw new UnprocessableEntityException('User does not exist')

    return updated
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.userService.remove(id)

    if (!deleted) throw new UnprocessableEntityException('User does not exist')

    return deleted
  }
}
