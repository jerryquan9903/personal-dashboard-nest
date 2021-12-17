import { GamesModule } from './games/games.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Games } from './games/games.entity';
import { TokenModule } from './token/token.module';
import { Token } from './token/token.entity';
import { WeatherModule } from './weather/weather.module';
import { YoutubeModule } from './youtube/youtube.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MongoNamingStrategy } from '@mikro-orm/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroOrmModule.forRoot({
      entities: [Games, Token],
      dbName: 'dashboard',
      type: 'mongo', 
      host: 'localhost',
      port: 27017,
      namingStrategy: MongoNamingStrategy
    }),
    GamesModule,
    TokenModule,
    WeatherModule,
    YoutubeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
