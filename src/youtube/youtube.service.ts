import { Injectable } from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import { google } from 'googleapis';
import { InjectRepository } from '@mikro-orm/nestjs';
import { YouTube } from './youtube.entity';
import { MongoEntityRepository } from '@mikro-orm/mongodb';

@Injectable()
export class YoutubeService {
  private googleToken: string;
  private youtube;

  constructor(
    @InjectRepository(YouTube)
    private youtubeRepo: MongoEntityRepository<YouTube>,
    private tokenFunctions: TokenService
  ) {
    (async () => {
      const tokens = await this.tokenFunctions.getTokenObject();
      this.googleToken = tokens.google.access;
    })();
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.googleToken
    })
  }

  async updateVideos(): Promise<any> {

  }
}
