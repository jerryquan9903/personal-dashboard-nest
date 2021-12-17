import { Entity, ObjectIdColumn, Column } from 'typeorm';

@Entity()
export class Token {

  @ObjectIdColumn()
  _id: string;

  @Column()
  name: string;

  @Column()
  thumbnail: string;

  @Column()
  uploadId: string;

  @Column()
  reddit: {
    clientId: string,
    clientSecret: string,
    username: string,
    password: string
  }
}