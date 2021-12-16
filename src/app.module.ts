import { GamesModule } from './games/games.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Games } from './games/games.entity';
import { TokenModule } from './token/token.module';
import { Token } from './token/token.entity';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: 'localhost',
      port: 27017,
      database: 'dashboard',
      entities: [Games, Token],
      synchronize: true,
      useUnifiedTopology: true
    }),
    GamesModule,
    TokenModule,
    WeatherModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
