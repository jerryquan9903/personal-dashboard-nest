import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TokenModule } from 'src/token/token.module';
import { MangaController } from './manga.controller';
import { Manga } from './manga.entity';
import { MangaService } from './manga.service';

@Module({
  imports: [MikroOrmModule.forFeature([Manga]), TokenModule, HttpModule],
  controllers: [MangaController],
  providers: [MangaService]
})
export class MangaModule {}
