import { Body, CacheInterceptor, Controller, Get, Post, Request, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MangaService } from './manga.service';

interface ILogin {
  username: string,
  password: string
}

@ApiTags('manga')
@Controller('manga')
export class MangaController {
  constructor(
    private manga: MangaService
  ) { }
 
  @Get('md/test')
  async testMd(): Promise<any> {
    return 'aaaa'
  }

  @Post('md/login')
  async mangaDexLogin(@Body() body: ILogin): Promise<any> {
    return await this.manga.mangaDexLogin(body.username, body.password);
  }

  @Get('md/list')
  @UseInterceptors(CacheInterceptor)
  async getMangaDexList(@Request() req: any): Promise<any> {
    return await this.manga.getMangaDexList(req.token);
  }

  @Get('md/feed')
  async getMangaDexFeed(@Request() req: any): Promise<any> {
    return await this.manga.getMangaDexFeed(req.token);
  }
}
