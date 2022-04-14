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

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(userLoginInput: LoginUserInput) {
    const user = await this.validateUser(userLoginInput);
    console.log(user);
    return this.generateToken(user);
  }

  async registration(userCreateInput: CreateUserInput) {
    const candidate = await this.userService.getUserByEmail(userCreateInput);
    if (candidate) {
      throw new HttpException(
        'Пользователь с таким email существует',
        HttpStatus.BAD_REQUEST,
      );
    }
    userCreateInput.password = await bcrypt.hash(userCreateInput.password, 5);
    const user = await this.userService.createUser({ ...userCreateInput });
    return this.generateToken(user);
  }

  async generateToken(user) {
    const payload = { id: user.id, email: user.email, username: user.username };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  async validateUser(candidate) {
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
  }
}
