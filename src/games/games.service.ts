import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Games } from "./games.entity";

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Games)
    private gamesRepo: Repository<Games>,
  ) { }

  async findByName(name: string): Promise<Games> {
    const test = await this.gamesRepo.find({
      name: name
    })

    return test[0];
  }
}