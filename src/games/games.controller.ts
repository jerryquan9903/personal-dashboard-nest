import { TokenService } from './../token/token.service';
import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Games } from "./games.entity";
import { GamesService } from "./games.service";

@ApiTags('Games')
@Controller('games')
export class GamesController {
  private tokenObj: any;
  private headers: {
    "Client-Id": string,
    Authorization: string,
  }

  constructor(
    private games: GamesService,
    private token: TokenService,
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
}