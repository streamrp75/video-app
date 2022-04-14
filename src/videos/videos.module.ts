import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoEntity } from './entities/video.entity';
import { VideosService } from './services/videos.service';
import { VideosController } from './controllers/videos.controller';
import { FilesModule } from '../files/files.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { UserVideoEntity } from './entities/user-video.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([VideoEntity, UserVideoEntity]),
    FilesModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY || 'SECRET_KEY',
      signOptions: {
        expiresIn: '24h',
      },
    }),
    UsersModule,
  ],
  providers: [VideosService],
  controllers: [VideosController],
  exports: [VideosService],
})
export class VideosModule {}
