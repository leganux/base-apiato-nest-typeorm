import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe',
    minLength: 4
  })
  @IsString()
  @MinLength(4)
  username: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'securePassword123',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The base URL for email verification',
    example: 'http://localhost:3000'
  })
  @IsString()
  baseUrl: string;
}
