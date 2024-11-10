import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/AuthCredentialsDto';
import { LoginDto } from './dto/LoginDto';
import { VerifyEmailDto } from './dto/verifyEmailDto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Registration successful, verify your email' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Email already in use or invalid data.'
  })
  @ApiBody({ type: AuthCredentialsDto })
  async register(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ) {
    const { email, password, name, username, baseUrl } = authCredentialsDto;
    return this.authService.register(email, password, name, username, baseUrl);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged in.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'ok' },
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        user: {
          type: 'object',
          properties: {
            username: { type: 'string', example: 'johndoe' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            timezone: { type: 'string', example: 'America/New_York' },
            country: { type: 'string', example: 'United States' },
            phone: { type: 'string', example: '+1234567890' },
            picture: { type: 'string', example: 'https://example.com/profile.jpg' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid credentials or email not verified.'
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    return this.authService.login(email, password);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email successfully verified.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email verified successfully' },
        status: { type: 'number', example: 200 },
        success: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid token or email already verified.'
  })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Email verification token',
    type: String
  })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
