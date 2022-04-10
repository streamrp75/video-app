import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserInput } from '../../inputs/create-user.input';
import { LoginUserInput } from '../../inputs/login-user.input';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}
  async createUser(userInput: CreateUserInput): Promise<object> {
    const candidate = await this.getUserByEmail(userInput);
    if (candidate) {
      throw new Error('Пользователь с такой почтой существует!');
    }
    userInput.password = await bcrypt.hash(userInput.password, 5);
    const user = await this.userRepository.save({ ...userInput });
    return this.generateToken(user);
  }

  async loginUser(loginUserInput: LoginUserInput): Promise<object> {
    const user = await this.validateUser(loginUserInput);
    return this.generateToken(user);
  }

  async getUserByEmail(loginUserInput: LoginUserInput): Promise<UserEntity> {
    return await this.userRepository.findOne({
      email: loginUserInput.email,
    });
  }

  async generateToken(user) {
    const payload = { id: user.id, email: user.email, username: user.username };
    return { token: this.jwtService.sign(payload) };
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async removeUser(id: number): Promise<number> {
    await this.userRepository.delete({ id });
    return id;
  }

  async validateUser(candidate) {
    const user = await this.userRepository.findOne({ email: candidate.email });
    if (!user) {
      throw new Error('Пользователя с такой почтой не существует!');
    }
    if (bcrypt.compare(candidate.password, user.email)) {
      return user;
    } else {
      throw new Error('Неправильный пароль!');
    }
  }
}
