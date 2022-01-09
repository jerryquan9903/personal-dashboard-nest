import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { IMangaName } from "./manga.interface";

@Entity({ collection: 'manga' })
export class Manga {
  @PrimaryKey()
  _id: string;

  @Property()
  name: string;

  @Property()
  cover: string;
}