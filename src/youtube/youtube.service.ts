import { Injectable } from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import { google } from 'googleapis';

@Injectable()
export class YoutubeService {
  private googleToken: string;
  private youtube;

  constructor(
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

  async getNewVideos(): Promise<any> {
    
  }
}
