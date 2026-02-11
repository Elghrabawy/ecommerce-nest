import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDto } from './register-user.dto';
import { IsString, MinLength, IsEmail } from 'class-validator';

export class UpdateUserDto extends PartialType(RegisterUserDto) {
  @IsString()
  @MinLength(3, { message: 'name must be at least 3 characters long' })
  name?: string;

  @IsEmail({}, { message: 'the email must be a valid email address' })
  email?: string;
}
