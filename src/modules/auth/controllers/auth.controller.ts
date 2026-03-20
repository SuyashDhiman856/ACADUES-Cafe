import { Body, Controller, Post, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { JwtGuard } from '../../../common/guards/jwt.guard'; 
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) { }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtGuard, RolesGuard)
  getMe(@Req() req) {
    return req.user;
  }

}