import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
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

  async requestToken(): Promise<IHeaders> {
    const tokenObject = await this.tokenFunctions.getTokenObject();
    const igdb = tokenObject.igdb;
    const now = dayjs(new Date()).unix();
    const expired: boolean = (igdb.expire + igdb.lastRequest) < now;
    const creds: ICreds = {
      client_id: igdb.clientId,
      client_secret: igdb.clientSecret,
      grant_type: "client_credentials"
    }

    if (igdb.access.length === 0 || expired) {
      let cred;

      try {
        const credData = await lastValueFrom(this.httpService.post(
          'https://id.twitch.tv/oauth2/token',
          null,
          {
            timeout: 6000,
            params: creds
          }
        ));
        cred = credData.data;
      } catch (e) {
        if (e.message.includes('timeout'))
          throw new HttpException('IGDB server error', HttpStatus.GATEWAY_TIMEOUT);
        else
          throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      // const cred = await lastValueFrom(getAccess)
      await this.tokenFunctions.updateToken('igdb',
        {
          client_id: igdb.clientId,
          client_secret: igdb.clientSecret,
          access: cred.access_token,
          expire: cred.expires_in,
          last_request: now
        })

      return {
        client_id: igdb.clientId,
        authorization: "Bearer " + cred.access_token
      }
    } else {
      return {
        client_id: igdb.clientId,
        authorization: "Bearer " + igdb.access
      }
    }
  }

  async getCover(game: Games): Promise<string> {
    let gameOnIGDB;
    let url;
    const headers = {
      "Client-Id": this.igdbHeaders.client_id,
      "Authorization": this.igdbHeaders.authorization
    }

    // search game & get game's cover ID
    try {
      const gameCover = await lastValueFrom(this.httpService.post(
        'https://api.igdb.com/v4/games/',
        `search "${game.name}"; fields cover;`,
        { timeout: 6000, headers: headers }
      ));

      gameOnIGDB = gameCover.data;
    } catch (e) {
      if (e.message.includes('timeout'))
        throw new HttpException('IGDB server error', HttpStatus.GATEWAY_TIMEOUT);
      else
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    };

    if (gameOnIGDB.length === 0) return "";

    // get game cover's URL
    try {
      const coverData = await lastValueFrom(this.httpService.post(
        'https://api.igdb.com/v4/covers/',
        `fields url; where id = ${gameOnIGDB[0].cover || -1};`,
        { timeout: 6000, headers: headers }
      ));

      url = coverData.data[0].url.replace("thumb", "1080p") || ""
    } catch (e) {
      if (e.message.includes('timeout'))
        throw new HttpException('IGDB server error', HttpStatus.GATEWAY_TIMEOUT);
      else
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    };

    if (url.length > 0) {
      this.gamesRepo.update({ "_id": game._id }, { coverUrl: url });
      return url;
    } else return "";
  }

  // games/current
  async getCurrentGame(): Promise<IGame> {
    let selectedGame: Games;
    const currentGames = await this.gamesRepo.find({
      completion: "Playing"
    });

    if (currentGames.length > 0) {
      // in case there's more than 1 game currently playing, get latest played
      currentGames.sort(function (a, b) { return b.lastPlayed - a.lastPlayed; })
      selectedGame = currentGames[0];
    } else {
      const notCompletedGames = await this.gamesRepo.find({
        where: { completion: { $ne: "Completed" } }
      });

      if (notCompletedGames.length === 0) {
        throw new HttpException('No games found', HttpStatus.NOT_FOUND)
      }

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

  // games/next
  async getNextGames(): Promise<INextGames[]> {
    const nextList = await this.gamesRepo.find({ completion: "Plan to Play" });

    if (nextList.length === 0)
      throw new HttpException('No games found', HttpStatus.NOT_FOUND)

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

  // games/details
  async getGameDetails(id: string): Promise<IGame> {
    const getGame = await this.gamesRepo.find({ _id: id });

    if (getGame.length === 0) {
      throw new HttpException('No games found', HttpStatus.NOT_FOUND)
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
