import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoEntity } from '../entities/video.entity';
import { CreateVideoInput } from '../inputs/create-video.input';
import { FilesService } from '../../files/services/files.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/user/users.service';
import { UserVideoEntity } from '../entities/user-video.entity';
import { UserEntity } from '../../users/entities/user.entity';
import * as path from 'path';

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
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async createVideo(videoInput: CreateVideoInput, video: any, token) {
    try {
      const email = await this.jwtService.verify(token);
      const user = await this.userService.getUserByEmail(email);
      const fileName = await this.filesService.createFile(video);
      const videoPost = await this.videoRepository.save({
        title: videoInput.title,
        authorId: user.id,
        video: fileName,
      });
      await this.userVideoRepository.save({
        userId: user.id,
        videoId: videoPost.id,
      });
      return videoPost;
    } catch (e) {}
  }

  async getUserVideos(token): Promise<VideoEntity[]> {
    try {
      const videos = [];
      const user = await this.jwtService.verify(token);
      const userVideos = await this.userVideoRepository.find({
        userId: user.id,
      });
      await Promise.all(
        userVideos.map(async (video) => {
          videos.push(
            await this.videoRepository.findOne({ id: video.videoId }),
          );
        }),
      );
      return videos;
    } catch (e) {}
  }

  async getVideoById(token, videoId, res): Promise<any> {
    try {
      const [video] = await this.getVideo(token, videoId);
      if (video) {
        return await res.sendFile(
          path.join(__dirname, '../../video_storage', `${video.video}`),
        );
      } else {
        throw new HttpException(
          'У вас нет такого видео',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (e) {}
  }

  async getVideo(token, videoId) {
    try {
      const user = await this.jwtService.verify(token);
      const userVideos = await this.userVideoRepository.find({
        userId: user.id,
      });
      let video;
      await Promise.all(
        userVideos.map(async (userVideo) => {
          if (userVideo.videoId == videoId) {
            video = await this.videoRepository.findOne({ id: videoId });
          }
        }),
      );
      if (video) {
        return [video, user.id];
      } else {
        throw new HttpException(
          'У вас нет такого видео',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (e) {}
  }

  async updateVideo(
    videoId,
    videoInput: CreateVideoInput,
    video: any,
    token,
  ): Promise<VideoEntity> {
    try {
      const [videoEntity, userId] = await this.getVideo(token, videoId);
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
      throw new HttpException('Ошибка', HttpStatus.BAD_REQUEST);
    }
  }

  async shareRights(token, videoId, email): Promise<string> {
    try {
      const video = await this.getVideo(token, videoId);
      if (video) {
        const user = await this.userRepository.findOne({ email: email });
        if (!user) {
          throw new HttpException(
            'Пользователя с таким email не существует',
            HttpStatus.BAD_REQUEST,
          );
        }
        if (
          await this.userVideoRepository.findOne({
            userId: user.id,
            videoId: videoId,
          })
        ) {
          throw new HttpException(
            'У пользователя с таким email уже есть права на это видео',
            HttpStatus.BAD_REQUEST,
          );
        }
        await this.userVideoRepository.save({
          userId: user.id,
          videoId: videoId,
        });
        return `Права на видео ${videoId} успешно разделены с пользователем ${user.username}`;
      } else {
        throw new HttpException(
          'У вас нет такого видео',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (e) {}
  }

  async deleteRights(token, videoId, email) {
    try {
      const video = await this.getVideo(token, videoId);
      if (video) {
        const user = await this.userRepository.findOne({ email: email });
        if (!user) {
          throw new HttpException(
            'Пользователя с таким email не существует',
            HttpStatus.BAD_REQUEST,
          );
        }
        const entity = await this.userVideoRepository.findOne({
          userId: user.id,
          videoId: videoId,
        });
        if (entity) {
          await this.userVideoRepository.remove(entity);
        } else {
          throw new HttpException(
            `У пользователя ${user.username} нет прав на это видео`,
            HttpStatus.BAD_REQUEST,
          );
        }
        return `Права на видео ${videoId} успешно удалены у пользователя ${user.username}`;
      } else {
        throw new HttpException(
          'У вас нет такого видео',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (e) {}
  }
}
