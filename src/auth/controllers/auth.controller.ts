import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserInput } from '../../users/inputs/create-user.input';
import { AuthService } from '../services/auth.service';
import { LoginUserInput } from '../../users/inputs/login-user.input';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  login(@Body() userDto: LoginUserInput) {
    return this.authService.login(userDto);
  }

  @Post('/registration')
  registration(@Body() userDto: CreateUserInput) {
    return this.authService.registration(userDto);
  }
}
