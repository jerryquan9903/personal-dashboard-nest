import { TokenService } from './../token/token.service';
import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Games } from "./games.entity";
import { GamesService } from "./games.service";

@ApiTags('Games')
@Controller('games')
export class GamesController {
  private tokenObj: any;

  constructor(
    private games: GamesService,
  ) {
    (async () => {
      this.tokenObj = await this.games.requestToken();
    })()
  }

  @Get('current')
  async getCurrentGame(): Promise<Games> {
    const game = await this.games.findByName("Tokyo Xanadu eX+");
    return game;
  }

  @Get('token')
  async getToken(): Promise<any> {
    return this.tokenObj
  }
}