import {
  IsEmail,
  IsString,
  IsNotEmpty,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterUserDto {
  @ApiProperty({
    description: 'The full name of the user',
    example: 'Ibrahim Alghrbawy',
  })
  @IsNotEmpty()
  @IsString({ message: 'the name must be a string' })
  @MinLength(3, { message: 'name must be at least 3 characters long' })
  name: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'borhom@example.com',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'the email must be a valid email address' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    description:
      'Password with at least 8 characters, including uppercase, lowercase, number and special character',
    example: 'MyPass123!',
    minLength: 8,
  })
  @IsString({ message: 'the password must be a string' })
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters with uppercase, lowercase, number and special character',
    },
  )
  password: string;
}
