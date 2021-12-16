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
    const game = await this.games.getCurrentGame();
    if (game.id?.length > 0) return game;
    else throw new HttpException('No games found', HttpStatus.NOT_FOUND)
  }

  @Get('next')
  async getNextGames(): Promise<INextGames[]> {
    const nextGames = await this.games.getNextGames();
    if (nextGames.length > 0) return nextGames;
    else throw new HttpException('No games found', HttpStatus.NOT_FOUND)
  }

  @Get('details')
  @ApiQuery({ name: 'id' })
  async getGameDetails(@Query('id') id: string): Promise<IGame> {
    const gameDetails = await this.games.getGameDetails(id);
    if (gameDetails.id !== id) {
      throw new HttpException('No games found', HttpStatus.NOT_FOUND)
    } else return gameDetails;
  }
}