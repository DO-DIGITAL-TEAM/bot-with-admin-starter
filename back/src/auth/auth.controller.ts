import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from './auth.guard';
import { CurrentAdmin } from 'src/common/decorators/current-admin.decorator';
import { Admin } from 'src/admins/entities/admin.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Post('register')
  register(
    @CurrentAdmin() admin: Admin,
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.register(admin, registerDto);
  }

  @Post('login')
  login(@Body() { email, password }: LoginDto) {
    return this.authService.login(email, password);
  }

  @UseGuards(AuthGuard)
  @Get('verify-token')
  verifyToken(@CurrentAdmin() admin: Admin) {
    return admin;
  }
}
