import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { CacheModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TokenModule } from 'src/token/token.module';
import { MangaController } from './manga.controller';
import { Manga } from './manga.entity';
import { MangaMiddleware } from './manga.middleware';
import { MangaService } from './manga.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Manga]),
    CacheModule.register({ ttl: 900, max: 10 }),
    TokenModule,
    HttpModule
  ],
  controllers: [MangaController],
  providers: [MangaService]
})
export class MangaModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MangaMiddleware).forRoutes('manga/md')
  }
}
