import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Headers,
  UseGuards,
  Get,
  Param,
  Put,
  Delete,
  Patch,
  Res,
} from '@nestjs/common';
import { VideosService } from '../services/videos.service';
import { CreateVideoInput } from '../inputs/create-video.input';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VideoEntity } from '../entities/video.entity';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private videoService: VideosService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Created post',
    type: VideoEntity,
  })
  @ApiResponse({
    status: 500,
    description: 'Creating error',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateVideoInput })
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

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Posts list',
    type: [VideoEntity],
  })
  @ApiResponse({
    status: 500,
    description: 'Getting error',
  })
  @UseGuards(JwtAuthGuard)
  async getUserVideos(@Headers('authorization') headers) {
    return await this.videoService.getUserVideos(headers.split(' ')[1]);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Get video by ID',
    type: VideoEntity,
  })
  @ApiResponse({
    status: 500,
    description: 'Getting error',
  })
  @UseInterceptors(FileInterceptor('video'))
  @UseGuards(JwtAuthGuard)
  async getVideoById(
    @Headers('authorization') headers,
    @Param('id') id: string,
    @Res() res,
  ) {
    return await this.videoService.getVideoById(headers.split(' ')[1], id, res);
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'Update video',
    type: [VideoEntity],
  })
  @ApiResponse({
    status: 500,
    description: 'Updating error',
  })
  @UseInterceptors(FileInterceptor('video'))
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateVideoInput })
  async updateVideo(
    @Param('id') id: string,
    @Body() createVideoInput: CreateVideoInput,
    @UploadedFile() video,
    @Headers('authorization') headers,
  ) {
    return await this.videoService.updateVideo(
      id,
      createVideoInput,
      video,
      headers.split(' ')[1],
    );
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Delete video',
    type: [VideoEntity],
  })
  @ApiResponse({
    status: 500,
    description: 'Deleting error',
  })
  @UseGuards(JwtAuthGuard)
  async deleteVideo(
    @Param('id') id: string,
    @Headers('authorization') headers,
  ) {
    return await this.videoService.deleteVideo(id, headers.split(' ')[1]);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Share rights',
    type: [VideoEntity],
  })
  @ApiResponse({
    status: 500,
    description: 'Transfer of rights error',
  })
  @UseGuards(JwtAuthGuard)
  async shareRights(
    @Param('id') videoId: string,
    @Headers('authorization') headers,
    @Body() email,
  ) {
    return await this.videoService.shareRights(
      headers.split(' ')[1],
      videoId,
      email.email,
    );
  }
  @Delete(':id/delete')
  @ApiResponse({
    status: 200,
    description: 'Delete shared rights',
    type: [VideoEntity],
  })
  @ApiResponse({
    status: 500,
    description: 'Deleting of rights error',
  })
  @UseGuards(JwtAuthGuard)
  async deleteRights(
    @Param('id') videoId: string,
    @Headers('authorization') headers,
    @Body() email,
  ) {
    return await this.videoService.deleteRights(
      headers.split(' ')[1],
      videoId,
      email.email,
    );
  }
}
