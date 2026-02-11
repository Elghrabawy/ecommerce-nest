import { IsEmail, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OtpPurpose } from './otp-purpose.enum';

export class SendOtpDto {
  @ApiProperty({
    description: 'The email address to send OTP to',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'the email must be a valid email address' })
  email: string;

  @ApiProperty({
    description: 'The purpose of the OTP',
    enum: OtpPurpose,
    enumName: 'OtpPurpose',
    example: OtpPurpose.EMAIL_VERIFICATION,
    required: false,
  })
  @IsOptional()
  @IsEnum(OtpPurpose, { message: 'purpose must be a valid OTP purpose' })
  purpose?: OtpPurpose;
}
