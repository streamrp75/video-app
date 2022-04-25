import { Controller, Post, Body, Res } from '@nestjs/common';
import { CreateUserInput } from '../../users/inputs/create-user.input';
import { AuthService } from '../services/auth.service';
import { LoginUserInput } from '../../users/inputs/login-user.input';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VideoEntity } from '../../videos/entities/video.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    type: [VideoEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'Authorization error',
  })
  @ApiBody({ type: LoginUserInput })
  login(@Body() userDto: LoginUserInput, @Res({ passthrough: true }) response) {
    return this.authService.login(userDto, response);
  }
  @Post('/registration')
  @ApiResponse({
    status: 200,
    description: 'Successfully registered',
    type: [VideoEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Authorization error',
  })
  @ApiBody({ type: CreateUserInput })
  registration(
    @Body() userDto: CreateUserInput,
    @Res({ passthrough: true }) response,
  ) {
    return this.authService.registration(userDto, response);
  }
}
