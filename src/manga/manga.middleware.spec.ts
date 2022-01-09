import { MangaMiddleware } from './manga.middleware';

describe('MangaMiddleware', () => {
  it('should be defined', () => {
    expect(new MangaMiddleware()).toBeDefined();
  });
});
