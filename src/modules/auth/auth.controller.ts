import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { RegisterUserDto } from 'src/modules/user/dtos/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  async create(@Body() login: RegisterUserDto) {
    return await this.AuthService.registerUser(login);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() loginDto: LoginDto) {
    return await this.AuthService.loginUser(loginDto);
  }

  @Post('verify-token')
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiBody({ schema: { properties: { token: { type: 'string' } } } })
  verifyToken(@Body('token') token: string) {
    return this.AuthService.verifyToken(token);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.AuthService.refreshToken(refreshTokenDto);
  }
}
