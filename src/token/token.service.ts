import { Token } from './token.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getMongoRepository, MongoRepository, Repository } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepo: MongoRepository<Token>,
  ) {}

  async getTokenObject(id: string): Promise<Token> {
    const tokenObject = await this.tokenRepo.findOne({
      _id: "token_" + id
    })

    return tokenObject;
  }

  async updateToken(id: string, data: any): Promise<Boolean> {
    const update = await this.tokenRepo.update({'_id': 'token_' + id}, data);
    return update.affected > 0;
  }
}
