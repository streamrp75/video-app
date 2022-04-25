import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserInput } from '../../inputs/create-user.input';
import { LoginUserInput } from '../../inputs/login-user.input';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(userInput: CreateUserInput): Promise<object> {
    return await this.userRepository.save(userInput);
  }

  async getUserByEmail(loginUserInput: LoginUserInput): Promise<UserEntity> {
    return await this.userRepository.findOne({
      email: loginUserInput.email,
    });
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }
}
