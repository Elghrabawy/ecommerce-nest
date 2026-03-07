import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDto } from './register-user.dto';
import { IsString, MinLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(RegisterUserDto) {
  @ApiProperty({
    description: 'The name of the user',
    example: 'Ibrahim Alghrbawy',
  })
  @IsString()
  @MinLength(3, { message: 'name must be at least 3 characters long' })
  name?: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'borhom@gmail.com',
  })
  @IsEmail({}, { message: 'the email must be a valid email address' })
  email?: string;
}
