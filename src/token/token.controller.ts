import { TokenService } from 'src/token/token.service';
import { Controller, Get } from '@nestjs/common';

@Controller('token')
export class TokenController {
  constructor(
    private token: TokenService
  ) {}

  @Get('test')
  async test(): Promise<boolean> {
    return this.token.updateToken('google', {test: 'AAAAAAA'});
  }
}
