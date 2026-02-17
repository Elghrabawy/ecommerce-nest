import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {

  @ApiProperty({
    description: 'Address title/label',
    example: 'Home Address',
  })
  @IsString()
  @MaxLength(100)
  Title: string;

  @ApiPropertyOptional({
    description: 'Company name',
    example: 'Tech Corp',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  company?: string;

  @ApiProperty({
    description: 'Street address',
    example: '123 Main Street',
  })
  @IsString()
  @MaxLength(255)
  streetAddress: string;

  @ApiPropertyOptional({
    description: 'Address line 2',
    example: 'Apt 4B',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
  })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'State/Province',
    example: 'NY',
  })
  @IsString()
  @MaxLength(100)
  state: string;

  @ApiProperty({
    description: 'Postal/ZIP code',
    example: '10001',
  })
  @IsString()
  @MaxLength(20)
  postalCode: string;

  @ApiProperty({
    description: 'Country code (2 letters)',
    example: 'US',
  })
  @IsString()
  @MaxLength(2)
  country: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+201096613552',
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
