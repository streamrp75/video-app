import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoEntity } from '../entities/video.entity';
import { CreateVideoInput } from '../inputs/create-video.input';
import { FilesService } from '../../files/services/files.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/user/users.service';
import { UserVideoEntity } from '../entities/user-video.entity';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(VideoEntity)
    private videoRepository: Repository<VideoEntity>,
    private userService: UsersService,
    private filesService: FilesService,
    private jwtService: JwtService,
    @InjectRepository(UserVideoEntity)
    private userVideoRepository: Repository<UserVideoEntity>,
  ) {}
  async createVideo(videoInput: CreateVideoInput, video: any, token) {
    const email = await this.jwtService.verify(token);
    const user = await this.userService.getUserByEmail(email);
    const fileName = await this.filesService.createFile(video);
    const videoPost = await this.videoRepository.save({
      title: videoInput.title,
      authorId: user.id,
      video: fileName,
    });
    return await this.userVideoRepository.save({
      userId: user.id,
      videoId: videoPost.id,
    });
  }
}
