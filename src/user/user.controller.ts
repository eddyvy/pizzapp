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
  BadRequestException,
} from '@nestjs/common'
import { JwtPayloadType } from '../auth/types/jwt.types'
import { JwtGuard, RolesGuard } from '../auth/guard'
import { JwtPayload, Roles } from '../auth/decorator'
import { CreateUserDto, UpdateUserDto } from './dto'
import { UserService } from './user.service'
import { ParseToValidIdStringPipe } from '../mongo/pipe/objectid.validation'

@UseGuards(JwtGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles('admin')
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto)
  }

  @Get('me')
  async findMe(@JwtPayload() payload: JwtPayloadType) {
    return await this.userService.findOne(payload.id)
  }

  @Roles('admin')
  @Get()
  async findAll() {
    return await this.userService.findAll()
  }

  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id', ParseToValidIdStringPipe) id: string) {
    const user = await this.userService.findOne(id)

    if (!user) throw new NotFoundException()

    return user
  }

  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id', ParseToValidIdStringPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (
      !updateUserDto ||
      Array.isArray(updateUserDto) ||
      typeof updateUserDto !== 'object' ||
      Object.keys(updateUserDto).length === 0
    )
      throw new BadRequestException()

    const updated = await this.userService.update(id, updateUserDto)

    if (!updated) throw new UnprocessableEntityException('User does not exist')

    return updated
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseToValidIdStringPipe) id: string) {
    const deleted = await this.userService.remove(id)

    if (!deleted) throw new UnprocessableEntityException('User does not exist')

    return deleted
  }
}
