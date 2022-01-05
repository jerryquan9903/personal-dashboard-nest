import { Token } from './token.entity';
import { Injectable } from '@nestjs/common';
import { MongoEntityRepository } from '@mikro-orm/mongodb';
import { InjectRepository } from '@mikro-orm/nestjs';
import { wrap } from '@mikro-orm/core';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepo: MongoEntityRepository<Token>,
  ) { }

  async getTokenObject(): Promise<Token> {
    const tokenObject = await this.tokenRepo.findOne({
      _id: "tokens"
    })

    return tokenObject;
  }

  async updateToken(id: string, data: any): Promise<boolean> {
    try {
      const tokenToUpdate = await this.tokenRepo.findOne({ _id: 'tokens' });
      if (id in tokenToUpdate) {
        wrap(tokenToUpdate).assign({ [id]: data }, { mergeObjects: true });
        await this.tokenRepo.flush();
      } else {
        tokenToUpdate[id] = data;
        await this.tokenRepo.persistAndFlush(tokenToUpdate);
      }

      return true;
    } catch (e) {
      return false;
    }
  }
}
