import { Entity, ObjectIdColumn, Column } from 'typeorm';

@Entity()
export class Games {
  @ObjectIdColumn()
  _id: string;

  @Column()
  name: string;

  @Column()
  gameId: string;

  @Column()
  source: string;

  @Column()
  platform: string;

  @Column() 
  genres: string;

  @Column()
  devs: string;

  @Column()
  description: string;

  @Column()
  completion: string;

  @Column()
  playTime: number;

  @Column()
  lastPlayed: number;

  @Column()
  releaseDate: string;

  @Column()
  coverUrl: string;
}