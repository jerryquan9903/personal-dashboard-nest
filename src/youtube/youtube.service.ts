import { IVideo, IChannel } from './youtube.interfaces';
import { Inject, Injectable, HttpException } from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import { google } from 'googleapis';
import { InjectRepository } from '@mikro-orm/nestjs';
import { YoutubeVideo, YoutubeChannel } from './youtube.entity';
import { MongoEntityRepository } from '@mikro-orm/mongodb';
import dayjs from 'dayjs';
import { QueryOrder } from '@mikro-orm/core';

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
  async getNew(): Promise<YoutubeVideo[]> {
    const channels = await this.channelRepo.find({});
    channels.forEach((channel) => {
      (async () => {
        const newestVideo = await this.videoRepo.find(
          { channelId: channel._id },
          { limit: 1, orderBy: { publishedAt: QueryOrder.DESC } }
        );

        await this.updateVideos(channel._id, channel.uploadId, channel.name, newestVideo[0]?.publishedAt || "");
      })()
    })

    const newVideos = await this.videoRepo.find({}, { limit: 10, orderBy: { publishedAt: QueryOrder.DESC } });
    return newVideos;
  }

  async updateVideos(id: string, uploadId: string, name: string, latest: string): Promise<boolean> {
    const resolutionPrefs = ['maxres', 'standard', 'high', 'medium', 'default'];

    try {
      const req = await this.youtube.playlistItems.list({
        part: "snippet,contentDetails",
        playlistId: uploadId,
        maxResults: 5,
      })

      if (req.data.items.length === 0) {
        console.log('No videos found');
        return;
      }
      const videos = req.data.items;

      videos.forEach((video) => {
        let thumbnail: string = "";

        if (latest.length > 0) {
          const latestDayjs = dayjs(latest);
          if (dayjs(video.contentDetails.videoPublishedAt).diff(latestDayjs) <= 0) {
            return;
          }
        }

        for (let i = 0; i < resolutionPrefs.length; i++) {
          if (resolutionPrefs[i] in video.snippet.thumbnails) {
            thumbnail = video.snippet.thumbnails[resolutionPrefs[i]].url;
            break;
          }
        }

        const toInsert = new YoutubeVideo();
        toInsert._id = video.id;
        toInsert.videoId = video.contentDetails.videoId;
        toInsert.videoName = video.snippet.title;
        toInsert.publishedAt = video.contentDetails.videoPublishedAt;
        toInsert.thumbnail = thumbnail;
        toInsert.channelId = id;
        toInsert.channelName = name;

        this.videoRepo.persist(toInsert);
      })
    } catch (e) {
      console.log(e);
      return false;
    }

    await this.videoRepo.flush();
    return true;
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
    const updateVids = await this.updateVideos(id, uploadId, name, "");

    if (updateVids)
      return 'Channel added'
    else return 'Channel added; update videos failed'
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