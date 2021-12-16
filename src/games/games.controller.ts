import { Controller, Get, HttpException, HttpStatus, Query, Req } from "@nestjs/common";
import { ApiProperty, ApiQuery, ApiTags } from "@nestjs/swagger";
import { IGame, INextGames } from "./games.interfaces";
import { GamesService } from "./games.service";

@ApiTags('Games')
@Controller('games')
export class GamesController {

  constructor(
    private games: GamesService,
  ) {

  }

  // test cover func
  // @Get('cover')
  // async getCover(): Promise<string> {
  //   return this.games.getCover({
  //     _id: "",
  //     name: "aaajdfvgervfa",
  //     gameId: "",
  //     source: "",
  //     platform: "",
  //     playTime: 0,
  //     lastPlayed: 0,
  //     genres: "",
  //     devs: "",
  //     releaseDate: "",
  //     description: "",
  //     coverUrl: "",
  //     completion: ""
  //   });
  // }

  @Get('current')
  async getCurrentGame(): Promise<IGame> {
    return this.games.getCurrentGame();
  }

  @Get('next')
  async getNextGames(): Promise<INextGames[]> {
    return this.games.getNextGames();
  }

  @Get('details')
  @ApiQuery({ name: 'id' })
  async getGameDetails(@Query('id') id: string): Promise<IGame> {
    return this.games.getGameDetails(id);
  }
}