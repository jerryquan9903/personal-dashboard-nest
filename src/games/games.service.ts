import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from "dayjs";
import { TokenService } from "src/token/token.service";
import { MongoRepository } from 'typeorm';
import { Games } from "./games.entity";
import { lastValueFrom } from "rxjs";
import { IGame, INextGames } from "./games.interfaces";

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
  private igdbHeaders: IHeaders;

  constructor(
    @InjectRepository(Games)
    private gamesRepo: MongoRepository<Games>,
    private tokenFunctions: TokenService,
    private httpService: HttpService
  ) {
    (async () => {
      this.igdbHeaders = await this.requestToken();
    })()
  }

  async findByName(name: string): Promise<Games> {
    const test = await this.gamesRepo.find({
      name: name
    })

    return test[0];
  }

  async requestToken(): Promise<IHeaders> {
    const tokenObject = await this.tokenFunctions.getTokenObject();
    const igdb = tokenObject.igdb;

    const creds: ICreds = {
      client_id: igdb.clientId,
      client_secret: igdb.clientSecret,
      grant_type: "client_credentials"
    }

    const now = dayjs(new Date()).unix();
    const expired: boolean = (igdb.expire + igdb.lastRequest) < now;

    if (igdb.access.length === 0 || expired) {
      const getAccess = this.httpService.post('https://id.twitch.tv/oauth2/token', null, {
        params: creds
      })
      const cred = await lastValueFrom(getAccess)
      await this.tokenFunctions.updateToken('igdb',
        {
          client_id: igdb.clientId,
          client_secret: igdb.clientSecret,
          access: cred.data.access_token,
          expire: cred.data.expires_in,
          last_request: now
        })

      return {
        client_id: igdb.clientId,
        authorization: "Bearer " + cred.data.access_token
      }
    } else {
      return {
        client_id: igdb.clientId,
        authorization: "Bearer " + igdb.access
      }
    }
  }

  async getCover(game: Games): Promise<string> {
    const getGame = await lastValueFrom(this.httpService.post(
      'https://api.igdb.com/v4/games/',
      `search "${game.name}"; fields cover;`,
      {
        headers: {
          "Client-Id": this.igdbHeaders.client_id,
          "Authorization": this.igdbHeaders.authorization
        }
      }
    ))

    const gameOnIGDB = getGame.data;

    const getCover = await lastValueFrom(this.httpService.post(
      'https://api.igdb.com/v4/covers/',
      `fields url; where id = ${gameOnIGDB[0].cover || -1};`,
      {
        headers: {
          "Client-Id": this.igdbHeaders.client_id,
          "Authorization": this.igdbHeaders.authorization
        }
      }
    ))

    const url = getCover.data[0].url.replace("thumb", "1080p") || "";

    if (url.length > 0) {
      this.gamesRepo.update({ "_id": game._id }, { coverUrl: url });
      return url;
    } else return "";
  }

  async getCurrentGame(): Promise<IGame> {
    let selectedGame: Games;
    const currentGames = await this.gamesRepo.find({
      completion: "Playing"
    });

    if (currentGames.length > 0) {
      currentGames.sort(function (a, b) {
        return a.lastPlayed - b.lastPlayed;
      })

      selectedGame = currentGames[0];
    } else {
      const notCompletedGames = await this.gamesRepo.find({
        where: { completion: { $ne: "Completed" } }
      });

      selectedGame = notCompletedGames[Math.round(Math.random() * notCompletedGames.length)];
    }

    const currentGameFinal: IGame = {
      id: selectedGame._id,
      name: selectedGame.name,
      image: selectedGame.coverUrl?.length > 0 ? selectedGame.coverUrl : await this.getCover(selectedGame),
      playTime: selectedGame.playTime,
      lastPlayed: selectedGame.lastPlayed,
      genres: selectedGame.genres,
      devs: selectedGame.devs,
      releaseDate: selectedGame.releaseDate,
      description: selectedGame.description
    }

    return currentGameFinal;
  }

  async getNextGames(): Promise<INextGames[]> {
    const nextList = await this.gamesRepo.find({ completion: "Plan to Play" });
    const nextResult: INextGames[] = await Promise.all(
      nextList.map(async (game) => {
        return {
          id: game._id,
          name: game.name,
          image: game.coverUrl?.length > 0 ? game.coverUrl : await this.getCover(game),
        }
      })
    )

    return nextResult;
  }

  async getGameDetails(id: string): Promise<IGame> {
    const getGame = await this.gamesRepo.find({ _id: id });

    if (getGame.length === 0) {
      return {
        id: "",
        name: "",
        image: "",
        playTime: 0,
        lastPlayed: 0,
        genres: "",
        devs: "",
        releaseDate: "",
        description: ""
      }
    } else {
      const game = getGame[0];
      const detailsResult = {
        id: game._id,
        name: game.name,
        image: game.coverUrl?.length > 0 ? game.coverUrl : await this.getCover(game),
        playTime: game.playTime,
        lastPlayed: game.lastPlayed,
        genres: game.genres,
        devs: game.devs,
        releaseDate: game.releaseDate,
        description: game.description
      }
      return detailsResult;
    }
  }
}
