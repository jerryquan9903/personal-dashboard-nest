import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import { AxiosError } from 'axios';

@Injectable()
export class WeatherService {
  private openWeatherKey: string;

  constructor(
    private tokenFunctions: TokenService,
    private httpService: HttpService
  ) {
    (async () => {
      const token = await this.tokenFunctions.getTokenObject();
      this.openWeatherKey = token.openWeather.access;
    })()
  }

  async getWeather(lat: number, lon: number): Promise<any> {
    let weatherData;

    await lastValueFrom(this.httpService.get(
      `http://api.openweathermap.org/data/2.5/onecall`,
      {
        timeout: 6000,
        params: {
          lat: lat,
          lon: lon,
          exclude: 'minutely',
          units: 'metric',
          appid: this.openWeatherKey
        }
      }
    )).then((success) => {
      weatherData = success.data
    }).catch((e) => {
      if (e.message.includes('timeout'))
        throw new HttpException('Weather server error', HttpStatus.GATEWAY_TIMEOUT);
    });

    return weatherData;
  }
}
