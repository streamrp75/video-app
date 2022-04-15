import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserInput } from '../../inputs/create-user.input';
import { LoginUserInput } from '../../inputs/login-user.input';
import { VideoEntity } from '../../../videos/entities/video.entity';
import { JwtService } from '@nestjs/jwt';
import { UserVideoEntity } from '../../../videos/entities/user-video.entity';
import { CreateVideoInput } from '../../../videos/inputs/create-video.input';
import { FilesService } from '../../../files/services/files.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    @InjectRepository(UserVideoEntity)
    private userVideoRepository: Repository<UserVideoEntity>,
    @InjectRepository(VideoEntity)
    private videoRepository: Repository<VideoEntity>,
    private filesService: FilesService,
  ) {}

  async createUser(userInput: CreateUserInput): Promise<object> {
    return this.userRepository.save(userInput);
  }

  async getUserByEmail(loginUserInput: LoginUserInput): Promise<UserEntity> {
    return await this.userRepository.findOne({
      email: loginUserInput.email,
    });
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async getUserVideos(token): Promise<VideoEntity[]> {
    const videos = [];
    const user = await this.jwtService.verify(token);
    const userVideos = await this.userVideoRepository.find({ userId: user.id });
    await Promise.all(
      userVideos.map(async (video) => {
        videos.push(await this.getVideoById(video.videoId));
      }),
    );
    return videos;
  }

  async getVideo(token, videoId): Promise<any> {
    const user = await this.jwtService.verify(token);
    const userVideos = await this.userVideoRepository.find({ userId: user.id });
    let video;
    await Promise.all(
      userVideos.map(async (userVideo) => {
        if (userVideo.videoId == videoId) {
          video = await this.getVideoById(videoId);
        }
      }),
    );
    if (video) {
      return [video, user.id];
    } else {
      throw new HttpException('У вас нет такого видео', HttpStatus.BAD_REQUEST);
    }
  }

  async getVideoById(id): Promise<VideoEntity> {
    return await this.videoRepository.findOne({ id: id });
  }

  async updateVideo(
    videoId,
    videoInput: CreateVideoInput,
    video: any,
    token,
  ): Promise<VideoEntity> {
    try {
      const [videoEntity, userId] = await this.getVideo(token, videoId);
      console.log(videoEntity);
      console.log(videoEntity.authorId != userId);
      if (videoEntity.authorId == userId) {
        await this.filesService.updateFile(video, videoEntity.video);
        videoEntity.title = videoInput.title;
        return await this.videoRepository.save(videoEntity);
      } else {
        throw 'Ошибка, вы не автор этого видео';
      }
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteVideo(videoId, token): Promise<string> {
    try {
      const [video, userId] = await this.getVideo(token, videoId);
      if (video.authorId == userId) {
        await this.filesService.deleteVideoFile(video.video);
        await this.videoRepository.remove(video);
        const userVideos = await this.userVideoRepository.find({
          videoId: videoId,
        });
        await this.userVideoRepository.remove(userVideos);
        return 'Удалено';
      } else {
        throw "Ошибка, вы не автор этого видео'";
      }
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  async shareRights(token, videoId, email): Promise<string> {
    await this.getVideo(token, videoId);
    const user = await this.userRepository.findOne({ email: email });
    if (!user) {
      throw new HttpException(
        'Пользователя с таким email не существует',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.userVideoRepository.save({ userId: user.id, videoId: videoId });
    return `Права на видео ${videoId} успешно разделены с пользователем ${user.username}`;
  }
}
