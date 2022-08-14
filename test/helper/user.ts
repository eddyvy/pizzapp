import { TestingModule } from '@nestjs/testing'
import { CreateUserDto } from '../../src/user/dto'
import { UserType } from '../../src/user/types/user.types'
import { UserModule } from '../../src/user/user.module'
import { UserService } from '../../src/user/user.service'

export async function checkOrCreateUser(
  moduleFixture: TestingModule,
  user: CreateUserDto,
): Promise<UserType> {
  const userService = moduleFixture.select(UserModule).get(UserService)
  const userAdmin = await userService.findByEmailAndPassword(
    user.email,
    user.password,
  )

  return userAdmin || (await userService.create(user))
}

export async function deleteUser(
  moduleFixture: TestingModule,
  user: CreateUserDto,
): Promise<void> {
  const userService = moduleFixture.select(UserModule).get(UserService)
  const userAdmin = await userService.findByEmailAndPassword(
    user.email,
    user.password,
  )

  if (!userAdmin) return

  await userService.remove(userAdmin.id)
}
