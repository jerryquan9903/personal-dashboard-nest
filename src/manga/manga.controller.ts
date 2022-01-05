import { Body, Controller, Post } from '@nestjs/common';
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

  @Post('md/login')
  async mangaDexLogin(@Body() body: ILogin): Promise<any> {
    return await this.manga.mangaDexLogin(body.username, body.password);
  }
}
