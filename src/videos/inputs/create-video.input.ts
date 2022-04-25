import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoInput {
  @ApiProperty()
  readonly title: string;
}
