import { YoutubeService } from './youtube.service';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('YouTube')
@Controller('youtube')
export class YoutubeController {
  constructor(
    private youtube: YoutubeService
  ) { }

  @Get('new')
  async getNew(): Promise<any> {
    
  }
}
