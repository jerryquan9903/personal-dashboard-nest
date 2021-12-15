import { Token } from './token.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepo: Repository<Token>,
  ) {}

  async getTokenObject(id: string): Promise<Token> {
    const tokenObject = await this.tokenRepo.findOne({
      _id: "token_" + id
    })

    return tokenObject;
  }
}
