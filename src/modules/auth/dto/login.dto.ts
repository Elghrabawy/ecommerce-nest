import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'the email must be a valid email address' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'SecurePassword123!',
  })
  @IsNotEmpty()
  @IsString({ message: 'the password must be a string' })
  password: string;
}
