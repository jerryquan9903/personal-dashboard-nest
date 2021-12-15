import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesService } from './games.service';
import { Module } from "@nestjs/common";
import { GamesController } from "./games.controller";
import { Games } from './games.entity';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [TypeOrmModule.forFeature([Games]), TokenModule],
  controllers: [GamesController],
  providers: [GamesService]
})

export class GamesModule {}