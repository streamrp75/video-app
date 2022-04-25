import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserInput } from '../../users/inputs/login-user.input';
import { CreateUserInput } from '../../users/inputs/create-user.input';
import { UsersService } from '../../users/services/user/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenRepository: Repository<RefreshTokenEntity>,
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(userLoginInput: LoginUserInput, response) {
    try {
      const user = await this.validateUser(userLoginInput);
      if (user) {
        const tokens = await this.generateToken(user);
        await this.saveToken(user, tokens.refreshToken);
        response.cookie('refreshToken', tokens.refreshToken, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
        });
        return tokens;
      } else {
        throw new HttpException('Ошибка', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (e) {}
  }

  async registration(userCreateInput: CreateUserInput, response) {
    try {
      const candidate = await this.userService.getUserByEmail(userCreateInput);
      if (candidate) {
        throw new HttpException(
          'Пользователь с таким email существует',
          HttpStatus.BAD_REQUEST,
        );
      }
      userCreateInput.password = await bcrypt.hash(userCreateInput.password, 5);
      const user = await this.userService.createUser({ ...userCreateInput });
      const tokens = await this.generateToken(user);
      await this.saveToken(user, tokens.refreshToken);
      response.cookie('refreshToken', tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return tokens;
    } catch (e) {}
  }

  async generateToken(user) {
    try {
      const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
      };
      return {
        accessToken: this.jwtService.sign(payload, {
          expiresIn: '30m',
        }),
        refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
      };
    } catch (e) {}
  }

  async saveToken(user, refreshToken) {
    try {
      const tokenData = await this.refreshTokenRepository.findOne({
        userId: user.id,
      });
      if (tokenData) {
        tokenData.refreshToken = refreshToken;
        return await this.refreshTokenRepository.save(tokenData);
      }
      return this.refreshTokenRepository.save({
        userId: user.id,
        refreshToken: await bcrypt.hash(refreshToken, 6),
      });
    } catch (e) {}
  }

  async validateUser(candidate) {
    try {
      const user = await this.userService.getUserByEmail(candidate);
      if (!user) {
        throw new UnauthorizedException({
          message: 'Пользователя с таким email не существует',
        });
      } else {
        if (await bcrypt.compare(candidate.password, user.password)) {
          return user;
        } else {
          throw new UnauthorizedException({
            message: 'Неправильный пароль',
          });
        }
      }
    } catch (e) {}
  }
}
