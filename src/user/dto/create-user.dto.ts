import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { UserRoleInterface } from '../interfaces/user.interface';

export class CreateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe'
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'securePassword123'
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    required: false
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+1234567890',
    required: false
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'URL to the user\'s profile picture',
    example: 'https://example.com/profile.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  picture?: string;

  @ApiProperty({
    description: 'The user\'s date of birth',
    example: '1990-01-01',
    required: false
  })
  @IsDate()
  @IsOptional()
  bornDate?: Date;

  @ApiProperty({
    description: 'The user\'s country',
    example: 'United States',
    required: false
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'The user\'s city',
    example: 'New York',
    required: false
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'The user\'s timezone',
    example: 'America/New_York',
    required: false
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({
    description: 'The user\'s address',
    example: '123 Main St',
    required: false
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Whether the user\'s email is verified',
    example: false,
    required: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiProperty({
    description: 'The user\'s role',
    enum: UserRoleInterface,
    example: UserRoleInterface.USER,
    default: UserRoleInterface.USER
  })
  @IsString()
  @IsOptional()
  role?: UserRoleInterface;
}
