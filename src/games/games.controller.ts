import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Games } from "./games.entity";
import { GamesService } from "./games.service";

@ApiTags('Games')
@Controller('games')
export class GamesController {

  constructor(
    private games: GamesService,
  ) { }

  @Get('current')
  async getCurrentGame(): Promise<Games> {
    const game = await this.games.findByName("Suikoden II");
    return game;
  }
}