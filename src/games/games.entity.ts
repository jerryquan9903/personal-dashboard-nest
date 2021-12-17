import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
@Entity()
export class Games {
  @PrimaryKey()
  _id: string;

  @Property()
  name: string;

  @Property()
  gameId: string;

  @Property()
  source: string;

  @Property()
  platform: string;

  @Property() 
  genres: string;

  @Property()
  devs: string;

  @Property()
  description: string;

  @Property()
  completion: string;

  @Property()
  playTime: number;

  @Property()
  lastPlayed: number;

  @Property()
  releaseDate: string;

  @Property()
  coverUrl: string;
}