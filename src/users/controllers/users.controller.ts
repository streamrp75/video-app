import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/user/users.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: [UserEntity],
  })
  @UseGuards(JwtAuthGuard)
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }
}
