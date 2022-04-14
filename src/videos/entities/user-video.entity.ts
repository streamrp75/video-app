import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user-video')
export class UserVideoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: false })
  videoId: number;
}
