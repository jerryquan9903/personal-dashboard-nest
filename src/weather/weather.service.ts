import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import { IWeather, IWeatherSingle } from './weather.interfaces';

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
    let weather;
    let city;

    const openWeatherParams = {
      lat: lat,
      lon: lon,
      exclude: 'minutely',
      units: 'metric',
      appid: this.openWeatherKey
    }

    const streetMapParams = {
      lat: lat,
      lon: lon,
      format: 'json',
      zoom: 14
    }

    try {
      const weatherGet = await lastValueFrom(this.httpService.get(
        `http://api.openweathermap.org/data/2.5/onecall`,
        {
          timeout: 6000,
          params: openWeatherParams
        }
      ));
      weather = weatherGet.data;
    } catch (e) {
      if (e.message.includes('timeout'))
        throw new HttpException('Weather server error', HttpStatus.GATEWAY_TIMEOUT);
    };

    try {
      const cityGet = await lastValueFrom(this.httpService.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          headers: { "accept-language": "en-US" },
          params: streetMapParams
        }
      ));
      city = cityGet.data;
    } catch (e) {
      if (e.message.includes('timeout'))
        throw new HttpException('StreetMap server error', HttpStatus.GATEWAY_TIMEOUT);
    }

    const current: IWeatherSingle = {
      datetime: weather.current.dt,
      temp: weather.current.temp,
      feelsLike: weather.current.feels_like,
      humidity: weather.current.humidity,
      uvIndex: weather.current.uvi,
      desc: weather.current.weather[0].description,
      descMain: weather.current.weather[0].main,
      condId: weather.current.weather[0].id,
      icon: weather.current.weather[0].icon
    }

    const hourly: IWeatherSingle[] = weather.hourly.map((hour) => {
      return {
        datetime: hour.dt,
        temp: hour.temp,
        feelsLike: hour.feels_like,
        humidity: hour.humidity,
        uvIndex: hour.uvi,
        desc: hour.weather[0].description,
        descMain: hour.weather[0].main,
        condId: hour.weather[0].id,
        icon: hour.weather[0].icon
      }
    })

    const daily: IWeatherSingle[] = weather.daily.map((day) => {
      return {
        datetime: day.dt,
        temp: day.temp,
        feelsLike: day.feels_like,
        humidity: day.humidity,
        uvIndex: day.uvi,
        desc: day.weather[0].description,
        descMain: day.weather[0].main,
        condId: day.weather[0].id,
        icon: day.weather[0].icon
      }
    })

    const weatherResponse: IWeather = {
      city: city.address?.city || "Unknown",
      country: city.address?.country || "Unknown",
      current: current,
      hourly: hourly,
      daily: daily
    }

    return weatherResponse;
  }
}
