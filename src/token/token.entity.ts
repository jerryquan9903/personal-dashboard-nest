import { Entity, ObjectIdColumn, Column } from 'typeorm';

@Entity()
export class Token {
  
  @ObjectIdColumn()
  _id: string;

  @Column()
  access: string;

  @Column()
  clientId: string;

  @Column()
  clientSecret: string;

  @Column()
  username: string;

  @Column() 
  password: string;

  @Column()
  expire: string;

  @Column()
  timeCalled: string;

}