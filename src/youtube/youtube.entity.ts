import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { IVideo } from "./youtube.interfaces";

@Entity()
export class YouTube {

  @PrimaryKey()
  _id: string;

  @Property()
  name: string;

  @Property()
  thumbnail: string;

  @Property()
  uploadId: string;

  @Property()
  videos: IVideo[];
}