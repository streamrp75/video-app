import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('videos')
export class VideoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  authorId: number;

  @Column()
  video: string;
}
