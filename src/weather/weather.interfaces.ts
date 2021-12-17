export interface IWeatherSingle {
  datetime: string,
  temp: number,
  feelsLike: number,
  humidity: number,
  uvIndex: number,
  desc: string,
  descMain: string,
  condId: number,
  icon: string
}

export interface IWeather {
  city: string,
  country: string,
  current: IWeatherSingle,
  hourly: IWeatherSingle[],
  daily: IWeatherSingle[]
}