import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from '../services/user/users.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateVideoInput } from '../../videos/inputs/create-video.input';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @Get('videos')
  @UseGuards(JwtAuthGuard)
  async getUserVideos(@Headers('authorization') headers) {
    return await this.usersService.getUserVideos(headers.split(' ')[1]);
  }

  @Get('videos/:id')
  @UseInterceptors(FileInterceptor('video'))
  @UseGuards(JwtAuthGuard)
  async getVideo(@Headers('authorization') headers, @Param('id') id: string) {
    return await this.usersService.getVideo(headers.split(' ')[1], id);
  }

  @Put('videos/:id')
  @UseInterceptors(FileInterceptor('video'))
  @UseGuards(JwtAuthGuard)
  async updateVideo(
    @Param('id') id: string,
    @Body() createVideoInput: CreateVideoInput,
    @UploadedFile() video,
    @Headers('authorization') headers,
  ) {
    return await this.usersService.updateVideo(
      id,
      createVideoInput,
      video,
      headers.split(' ')[1],
    );
  }

  @Delete('videos/:id')
  @UseGuards(JwtAuthGuard)
  async deleteVideo(
    @Param('id') id: string,
    @Headers('authorization') headers,
  ) {
    return await this.usersService.deleteVideo(id, headers.split(' ')[1]);
  }

  @Patch('videos/:id')
  @UseGuards(JwtAuthGuard)
  async shareRights(
    @Param('id') videoId: string,
    @Headers('authorization') headers,
    @Body() email,
  ) {
    return await this.usersService.shareRights(
      headers.split(' ')[1],
      videoId,
      email.email,
    );
  }
}
