import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { UserRole } from '../enum/user-role.enum'

export type UserDocument = User & Document

@Schema()
export class User {
  @Prop({ required: true })
  name: string

  @Prop({ unique: true, required: true })
  email: string

  @Prop({ required: true })
  hash: string

  @Prop({ default: 'user' })
  role: UserRole
}

export const UserSchema = SchemaFactory.createForClass(User)
