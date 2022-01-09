import { ApiQuery } from '@nestjs/swagger';
import { YoutubeService } from './youtube.service';
import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { YoutubeVideo } from './youtube.entity';
import { IChannel, IVideo } from './youtube.interfaces';

@ApiTags('YouTube')
@Controller('youtube')
export class YoutubeController {
  constructor(
    private youtube: YoutubeService
  ) { }

  @Get('video/new')
  async getNew(): Promise<IVideo[]> {
    return await this.youtube.getNew();
  }

  @Get('channel/get')
  async getAllChannels(): Promise<IChannel[]> {
    return await this.youtube.getAllChannels();
  }

  @Get('channel/search')
  @ApiQuery({ name: 'name' })
  async searchChannel(@Query('name') name: string): Promise<IChannel[]> {
    return await this.youtube.searchChannel(name);
  }

  @Post('channel/insert')
  async insertChannel(@Body() body: any): Promise<string> {
    return await this.youtube.insertChannel(body.id);
  }

  @Delete('channel/delete')
  async deleteChannel(@Body() body: any): Promise<string> {
    return await this.youtube.deleteChannel(body.id);
  }
}
