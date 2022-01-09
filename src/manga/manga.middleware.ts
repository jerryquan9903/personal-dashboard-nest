import { MongoEntityRepository } from '@mikro-orm/mongodb';
import { InjectRepository } from '@mikro-orm/nestjs';
import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { TokenService } from 'src/token/token.service';
import { Manga } from './manga.entity';

@Injectable()
export class MangaMiddleware implements NestMiddleware {
  private api = 'https://api.mangadex.org/';

  constructor(
    @InjectRepository(Manga)
    private mangaRepo: MongoEntityRepository<Manga>,
    private tokenFunctions: TokenService,
    private httpService: HttpService
  ) { }

  async use(req: any, res: any, next: () => void) {
    const token = await this.checkToken();
    req.token = token;
    next();
  }

  async checkToken(): Promise<any> {
    const tokens = await this.tokenFunctions.getTokenObject();
    const mdToken = tokens.mangadex;

    let checkResult;
    try {
      const check = await lastValueFrom(this.httpService.get(this.api + 'auth/check', {
        headers: {
          Authorization: `Bearer ${mdToken.session}`
        }
      }))

      checkResult = check.data;
    } catch (e) {
      console.log(e)
    }

    if (!checkResult.isAuthenticated) {
      const newToken = await this.refreshToken();
      return newToken;
    } else {
      return mdToken.session;
    }
  }

  async refreshToken(): Promise<any> {
    const tokens = await this.tokenFunctions.getTokenObject();
    const mdToken = tokens.mangadex;

    let ref;
    try {
      const refresh = await lastValueFrom(this.httpService.post(
        this.api + 'auth/refresh',
        { token: mdToken.refresh }
      ))

      ref = refresh.data;
    } catch (e) {
      console.log(e)
    }

    if (ref.result !== 'ok') {
      throw new HttpException('Unauthorized', 401);
    } else {
      const creds = {
        ...mdToken,
        session: ref.token.session,
        refresh: ref.token.refresh
      }

      await this.tokenFunctions.updateToken("mangadex", creds);

      return ref.token.session;
    }
  }
}
