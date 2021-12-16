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