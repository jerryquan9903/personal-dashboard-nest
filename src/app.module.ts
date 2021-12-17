import { GamesModule } from './games/games.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TokenModule } from './token/token.module';
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
      entities: ['dist/src/**/*.entity.js'],
      entitiesTs: ['src/**/*.entity.{ts,js}'],
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
