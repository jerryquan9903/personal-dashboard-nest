import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { IMangaName } from "./manga.interface";

@Entity()
export class Manga {
  @PrimaryKey()
  _id: string;

  @Property()
  names: IMangaName;

  @Property()
  cover: string;

  @Property()
  latestChapter: number;

  @Property()
  latestUrl: string;
}