import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from "dayjs";
import { AxiosResponse } from 'axios';
import { TokenService } from "src/token/token.service";
import { Repository } from 'typeorm';
import { Games } from "./games.entity";
import { lastValueFrom, Observable } from "rxjs";
import { map } from 'rxjs/operators';

interface IHeaders {
  client_id: string,
  authorization: string,
}

interface ICreds {
  client_id: string,
  client_secret: string,
  grant_type: string
}
@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Games)
    private gamesRepo: Repository<Games>,
    private tokenFunctions: TokenService,
    private httpService: HttpService
  ) { }

  async findByName(name: string): Promise<Games> {
    const test = await this.gamesRepo.find({
      name: name
    })

    return test[0];
  }

  async requestToken(): Promise<IHeaders> {
    const tokenObject = await this.tokenFunctions.getTokenObject('igdb');
    const creds: ICreds = {
      client_id: tokenObject.clientId,
      client_secret: tokenObject.clientSecret,
      grant_type: "client_credentials"
    }

    const now = dayjs(new Date()).unix();
    const expired: boolean = (tokenObject.expire + tokenObject.timeCalled) < now;

    if (tokenObject.access.length === 0 || expired) {
      const getAccess = this.httpService.post('https://id.twitch.tv/oauth2/token', null, {
        params: creds
      })
      const cred = await lastValueFrom(getAccess)
      await this.tokenFunctions.updateToken('igdb',
        {
          access: cred.data.access_token,
          expire: cred.data.expires_in,
          timeCalled: now
        })

      return {
        client_id: tokenObject.clientId,
        authorization: "Bearer " + cred.data.access_token
      }
    } else {
      return {
        client_id: tokenObject.clientId,
        authorization: "Bearer " + tokenObject.access
      }
    }
  }
}
