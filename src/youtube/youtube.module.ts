import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';
import { HttpModule } from '@nestjs/axios';
import { TokenModule } from './../token/token.module';
import { YoutubeVideo, YoutubeChannel } from './youtube.entity';

@Module({
  imports: [MikroOrmModule.forFeature([YoutubeVideo, YoutubeChannel]), TokenModule, HttpModule],
  controllers: [YoutubeController],
  providers: [YoutubeService]
})
export class YoutubeModule {}
