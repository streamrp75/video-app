import { ApiProperty } from '@nestjs/swagger';

export class LoginUserInput {
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
}
