import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { Controller, Get, Query } from '@nestjs/common';
import { IWeather } from './weather.interfaces';

class Position {
  @ApiProperty()
  lat: number;

  @ApiProperty()
  lon: number;
}

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(
    private weather: WeatherService,
  ) {

  }

  @Get()
  async getWeather(@Query() pos: Position): Promise<IWeather | any> {
    return this.weather.getWeather(pos.lat, pos.lon);
  }
}
