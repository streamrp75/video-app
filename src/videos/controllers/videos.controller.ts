import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { VideosService } from '../services/videos.service';
import { CreateVideoInput } from '../inputs/create-video.input';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('videos')
export class VideosController {
  constructor(private videoService: VideosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  async createVideo(
    @Body() createVideoInput: CreateVideoInput,
    @UploadedFile() video,
    @Headers('authorization') headers,
  ) {
    return await this.videoService.createVideo(
      createVideoInput,
      video,
      headers.split(' ')[1],
    );
  }
}
