export interface IGame {
  id: string,
  name: string,
  image: string,
  playTime: number,
  lastPlayed: number,
  genres: string,
  devs: string,
  releaseDate: string,
  description: string,
}

export interface INextGames {
  id: string,
  name: string,
  image: string
}