import { MongoEntityRepository } from '@mikro-orm/mongodb';
import { InjectRepository } from '@mikro-orm/nestjs';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import { Manga } from './manga.entity';
import bcrypt from 'bcryptjs';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class MangaService {
  private api = 'https://api.mangadex.org/';

  constructor(
    @InjectRepository(Manga)
    private mangaRepo: MongoEntityRepository<Manga>,
    private tokenFunctions: TokenService,
    private httpService: HttpService
  ) { }

  async mangaDexLogin(username: string, password: string): Promise<any> {
    let tokens;

    try {
      const loginMd = await lastValueFrom(this.httpService.post(
        this.api + "auth/login",
        {
          username: username,
          password: password
        },
        { timeout: 6000 }
      ))
      tokens = loginMd.data;
    } catch (e) {
      throw new HttpException('Incorrect username/password', 401)
    }
    
    if (tokens.result !== "ok") {
      throw new HttpException('Error logging into MangaDex', 500)
    }

    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(password, salt);

    const creds = {
      session: tokens.token.session,
      refresh: tokens.token.refresh,
      username: username,
      password: hash
    }

    const putToDb = await this.tokenFunctions.updateToken("mangadex", creds);
    console.log(putToDb);
    return tokens;
  }
}
