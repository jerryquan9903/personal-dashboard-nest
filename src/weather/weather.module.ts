import { HttpModule } from '@nestjs/axios';
import { TokenModule } from './../token/token.module';
import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
  imports: [TokenModule, HttpModule],
  controllers: [WeatherController],
  providers: [WeatherService]
})
export class WeatherModule {}
