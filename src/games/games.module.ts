import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesService } from './games.service';
import { Module } from "@nestjs/common";
import { GamesController } from "./games.controller";
import { Games } from './games.entity';
import { TokenModule } from '../token/token.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Games]), TokenModule, HttpModule],
  controllers: [GamesController],
  providers: [GamesService]
})

export class GamesModule {}