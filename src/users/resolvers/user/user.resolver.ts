import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from '../../services/user/user.service';
import { TokenEntity, UserEntity } from '../../entities/user.entity';
import { CreateUserInput } from '../../inputs/create-user.input';
import { LoginUserInput } from '../../inputs/login-user.input';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => TokenEntity)
  async createUser(
    @Args('createUser') createUserInput: CreateUserInput,
  ): Promise<object> {
    return await this.userService.createUser(createUserInput);
  }

  @Mutation(() => TokenEntity)
  async loginUser(
    @Args('loginUser') loginUserInput: LoginUserInput,
  ): Promise<object> {
    return await this.userService.loginUser(loginUserInput);
  }

  @Mutation(() => Number)
  async removeUser(@Args('id') id: number): Promise<number> {
    return await this.userService.removeUser(id);
  }

  @Query(() => [UserEntity])
  async getAllUsers(): Promise<UserEntity[]> {
    return await this.userService.getAllUsers();
  }
}
