import { Module } from '@nestjs/common';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';
import { HttpModule } from '@nestjs/axios';
import { TokenModule } from './../token/token.module';

@Module({
  imports: [TokenModule, HttpModule],
  controllers: [YoutubeController],
  providers: [YoutubeService]
})
export class YoutubeModule {}
