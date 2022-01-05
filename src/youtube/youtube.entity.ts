import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ collection: 'youtube' })
export class YoutubeVideo {
  @PrimaryKey()
  _id: string;

  @Property()
  videoId: string;

  @Property()
  videoName: string;

  @Property()
  publishedAt: string;

  @Property()
  thumbnail: string;

  @Property()
  channelId: string;

  @Property()
  channelName: string;
}

@Entity({ collection: 'youtube-channels' })
export class YoutubeChannel {
  @PrimaryKey()
  _id: string;

  @Property()
  name: string;

  @Property()
  thumbnail: string;

  @Property()
  uploadId: string;
}