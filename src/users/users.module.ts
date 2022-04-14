import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './services/user/users.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './controllers/users.controller';
import { UserVideoEntity } from '../videos/entities/user-video.entity';
import { VideoEntity } from '../videos/entities/video.entity';
import { FilesModule } from '../files/files.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserVideoEntity, VideoEntity]),
    forwardRef(() => AuthModule),
    JwtModule.register({
      secret: process.env.SECRET_KEY || 'SECRET_KEY',
      signOptions: {
        expiresIn: '24h',
      },
    }),
    FilesModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
