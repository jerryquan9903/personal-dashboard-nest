export interface IVideo {
  _id: string,
  videoId: string,
  videoName: string,
  publishedAt: string,
  thumbnail: string,
  channelId: string,
  channelName: string
}

export interface IChannel {
  name: string,
  id: string,
  thumbnail: string
}