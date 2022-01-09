import { IVideo, IChannel } from './youtube.interfaces';
import { Injectable, HttpException } from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import { google } from 'googleapis';
import { InjectRepository } from '@mikro-orm/nestjs';
import { YoutubeVideo, YoutubeChannel } from './youtube.entity';
import { MongoEntityRepository } from '@mikro-orm/mongodb';
import dayjs from 'dayjs';

@Injectable()
export class YoutubeService {
  private googleToken: string;
  private youtube;

  constructor(
    @InjectRepository(YoutubeChannel)
    private channelRepo: MongoEntityRepository<YoutubeChannel>,

    @InjectRepository(YoutubeVideo)
    private videoRepo: MongoEntityRepository<YoutubeVideo>,

    private tokenFunctions: TokenService
  ) {
    (async () => {
      const tokens = await this.tokenFunctions.getTokenObject();
      this.googleToken = tokens.google.access;
      this.youtube = google.youtube({
        version: 'v3',
        auth: this.googleToken
      })
    })();
  }

  // youtube/video/new
  async getNew(): Promise<IVideo[]> {
    const resolutionPrefs = ['maxres', 'standard', 'high', 'medium', 'default'];
    const channels = await this.channelRepo.find({});

    const toReturn = [];

    for (const channel of channels) {
      try {
        const req = await this.youtube.playlistItems.list({
          part: "snippet,contentDetails",
          playlistId: channel.uploadId,
          maxResults: 5,
        })

        if (req.data.items.length === 0) {
          console.log('No videos found');
          return;
        }
        const videos = req.data.items;

        const mappedVideos: IVideo[] = videos.map((video) => {
          let thumbnail: string = "";

          for (let i = 0; i < resolutionPrefs.length; i++) {
            if (resolutionPrefs[i] in video.snippet.thumbnails) {
              thumbnail = video.snippet.thumbnails[resolutionPrefs[i]].url;
              break;
            }
          }

          return {
            _id: video.id,
            videoId: video.contentDetails.videoId,
            videoName: video.snippet.title,
            publishedAt: video.contentDetails.videoPublishedAt,
            thumbnail: thumbnail,
            channelId: channel._id,
            channelName: channel.name,
          }
        })

        toReturn.push(mappedVideos);
      } catch (e) {
        console.log(e);
      }
    }

    const flatten = toReturn.flat();

    flatten.sort((a, b) => {
      return dayjs(b.publishedAt).unix() - dayjs(a.publishedAt).unix();
    });

    return flatten.slice(0, 10);
  }

  // /youtube/channel/insert
  async insertChannel(id: string): Promise<string> {
    const checkId = await this.channelRepo.find({ _id: id });
    if (checkId.length > 0) {
      throw new HttpException('Channel already exists', 400);
    }

    const req = await this.youtube.channels.list({
      part: "snippet,contentDetails",
      id: id,
      maxResults: 15
    })

    if (!req.data.items) {
      throw new HttpException('No channels with this ID found', 404)
    }

    const channel = req.data.items[0];

    const uploadId = channel.contentDetails.relatedPlaylists.uploads;
    const name = channel.snippet.title;

    const toInsert = new YoutubeChannel();
    toInsert._id = id;
    toInsert.name = name;
    toInsert.thumbnail = channel.snippet.thumbnails.default.url;
    toInsert.uploadId = uploadId;

    await this.channelRepo.persistAndFlush(toInsert);
    return 'ok'

  }

  // youtube/channel/delete
  async deleteChannel(id: string): Promise<string> {
    const channelToDelete = await this.channelRepo.findOne({ _id: id });
    const videosToDelete = await this.videoRepo.find({ channelId: id });

    if (!channelToDelete) {
      throw new HttpException('Channel does not exist', 404);
    }

    this.channelRepo.removeAndFlush(channelToDelete);

    if (videosToDelete.length === 0) return;
    videosToDelete.forEach((video) => {
      this.videoRepo.remove(video);
    })

    this.videoRepo.flush();
    return "Channel deleted";
  }

  // youtube/channel/search
  async searchChannel(name: string): Promise<IChannel[]> {
    const req = await this.youtube.search.list({
      part: "snippet",
      q: name,
      type: "channel",
      maxResults: 25,
    })

    if (!req.data.items) {
      throw new HttpException('Search return no results', 404)
    }

    const res = req.data.items;
    const toReturn = res.map((channel) => {
      return {
        name: channel.snippet.channelTitle,
        id: channel.snippet.channelId,
        thumbnail: channel.snippet.thumbnails.default.url
      }
    })

    return toReturn;
  }

  // youtube/channel/get
  async getAllChannels(): Promise<IChannel[]> {
    const channels = await this.channelRepo.find({});

    return channels.map((channel) => {
      return {
        name: channel.name,
        id: channel._id,
        thumbnail: channel.thumbnail
      }
    })
  }
}