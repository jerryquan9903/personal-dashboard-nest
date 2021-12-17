import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Token {

  @PrimaryKey()
  _id: string;

  @Property()
  igdb: {
    clientId: string,
    clientSecret: string,
    access: string,
    expire: number,
    lastRequest: number,
  }

  @Property()
  openWeather: {
    access: string,
  }

  @Property()
  google: {
    access: string,
  }

  @Property()
  reddit: {
    clientId: string,
    clientSecret: string,
    username: string,
    password: string
  }
}