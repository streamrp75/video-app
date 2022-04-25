import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('refreshToken')
export class RefreshTokenEntity {
  @ApiProperty()
  @PrimaryColumn()
  userId: number;

  @ApiProperty()
  @Column()
  refreshToken: string;
}
