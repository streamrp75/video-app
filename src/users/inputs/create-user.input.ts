import { ApiProperty } from '@nestjs/swagger';

export class CreateUserInput {
  @ApiProperty()
  email: string;
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
}
