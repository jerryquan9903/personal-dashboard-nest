import { Entity, ObjectIdColumn, Column } from 'typeorm';

@Entity()
export class Token {

  @ObjectIdColumn()
  _id: string;

  @Column()
  igdb: {
    clientId: string,
    clientSecret: string,
    access: string,
    expire: number,
    lastRequest: number,
  }

  @Column()
  openWeather: {
    access: string,
  }

  @Column()
  google: {
    access: string,
  }

  @Column()
  reddit: {
    clientId: string,
    clientSecret: string,
    username: string,
    password: string
  }
}