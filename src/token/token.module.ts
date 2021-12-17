import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { Token } from './token.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Token])],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService]
})
export class TokenModule {} 
 