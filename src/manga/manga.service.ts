import { MongoEntityRepository } from '@mikro-orm/mongodb';
import { InjectRepository } from '@mikro-orm/nestjs';
import { HttpException, Injectable } from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import { Manga } from './manga.entity';
import bcrypt from 'bcryptjs';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import qs from 'qs';
import { wrap } from '@mikro-orm/core';
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

    await this.tokenFunctions.updateToken("mangadex", creds);
    return tokens;
  }

  async mangaDexLogout(): Promise<any> {
    await this.tokenFunctions.updateToken("mangadex", {});
  }

  async getMangaDexList(token: string): Promise<any> {
    let mangaList;

    const currentList = await this.mangaRepo.find({}, { fields: ["_id"] })

    try {
      const list = await lastValueFrom(this.httpService.get(
        this.api + `user/follows/manga?limit=50&includes[]=cover_art`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      ))
      mangaList = list.data;
    } catch (e) {
      console.log(e);
      throw new HttpException('Unauthorised', 401);
    }

    if (mangaList.result !== 'ok') {
      throw new HttpException('Error retrieving manga list', 502)
    }

    const mangaIds = [];

    for (const manga of mangaList.data) {
      const toInsert = new Manga();
      mangaIds.push(manga.id);

      const coverArt = manga.relationships.find((item) => item.type === "cover_art");

      toInsert._id = manga.id;
      toInsert.name = manga.attributes.title.en;
      toInsert.cover = coverArt.attributes?.fileName || "";

      const mangaToUpdate = await this.mangaRepo.findOne({ _id: manga.id });
      if (!mangaToUpdate) {
        this.mangaRepo.persist(toInsert);
      } else {
        wrap(mangaToUpdate).assign(toInsert, { mergeObjects: true });
      }
    }

    for (const manga of currentList) {
      if (!mangaIds.includes(manga._id)) {
        this.mangaRepo.nativeDelete({ _id: manga._id });
      }
    }

    await this.mangaRepo.flush();

    return "ok";
  }

  async getMangaDexFeed(token: string): Promise<any> {
    let feedList;

    try {
      const list = await lastValueFrom(this.httpService.get(
        this.api + 'user/follows/manga/feed',
        {
          params: {
            limit: 20,
            translatedLanguage: ["en"],
            order: {
              publishAt: "desc"
            },
          },
          paramsSerializer: params => qs.stringify(params),
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      ))
      feedList = list.data;
    } catch (e) {
      console.log(e);
      throw new HttpException('Unauthorised', 401);
    }

    if (feedList.result !== 'ok') {
      throw new HttpException('Error retrieving manga feed', 502)
    }

    const chapters = [];

    for (const chapter of feedList.data) {
      const mangaId = chapter.relationships[1].id;
      const manga = await this.mangaRepo.findOne({ _id: mangaId });

      if (!manga) continue;

      const toResponse = {
        id: chapter.id,
        name: chapter.attributes.title || "",
        chapter: chapter.attributes.chapter,
        mangaName: manga.name,
        cover: "https://uploads.mangadex.org/covers/" + manga._id + "/" + manga.cover + ".512.jpg",
        url: chapter.attributes.externalUrl || "https://mangadex.org/chapter/" + chapter.id,
        published: chapter.attributes.publishAt
      }

      chapters.push(toResponse);
    }

    return chapters;
  }
}
