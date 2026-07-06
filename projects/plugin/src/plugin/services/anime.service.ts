import { Injectable } from '@angular/core';

export interface AnimeResult {
  malId: number;
  title: string;
  imageUrl: string;
  synopsis: string;
  score: number | null;
  episodes: number | null;
  status: string;
  year: number | null;
  season: string | null;
  genres: string[];
  url: string;
}

export interface AnimeSearchParams {
  query?: string;
  genre?: string;
  season?: string;
  year?: number;
  status?: string;
  page?: number;
}

// Static genre list from Jikan's /genres/anime endpoint (MyAnimeList genre IDs).
// Kept as a constant so the filter UI can populate instantly without a network round trip.
export const ANIME_GENRES: { id: number; name: string }[] = [
  { id: 1, name: 'Action' },
  { id: 2, name: 'Adventure' },
  { id: 4, name: 'Comedy' },
  { id: 8, name: 'Drama' },
  { id: 10, name: 'Fantasy' },
  { id: 7, name: 'Mystery' },
  { id: 22, name: 'Romance' },
  { id: 24, name: 'Sci-Fi' },
  { id: 36, name: 'Slice of Life' },
  { id: 30, name: 'Sports' },
  { id: 37, name: 'Supernatural' },
  { id: 41, name: 'Thriller' },
  { id: 14, name: 'Horror' },
  { id: 27, name: 'Shounen' },
  { id: 25, name: 'Shoujo' },
];

export const ANIME_SEASONS = ['winter', 'spring', 'summer', 'fall'];

const JIKAN_BASE = 'https://api.jikan.moe/v4';

@Injectable()
export class AnimeService {
  /**
   * Searches anime via the Jikan API (a free, public wrapper around MyAnimeList).
   * Jikan applies its own rate limiting, so callers should debounce user input
   * before invoking this.
   */
  async search(params: AnimeSearchParams): Promise<{ results: AnimeResult[]; hasNextPage: boolean }> {
    const url = new URL(`${JIKAN_BASE}/anime`);

    if (params.query) {
      url.searchParams.set('q', params.query);
    }
    if (params.genre) {
      url.searchParams.set('genres', params.genre);
    }
    if (params.status) {
      url.searchParams.set('status', params.status);
    }
    if (params.season && params.year) {
      // Jikan has a dedicated seasonal endpoint; use it when both are set for better accuracy.
      return this.searchBySeason(params.year, params.season, params);
    }
    if (params.year && !params.season) {
      url.searchParams.set('start_date', `${params.year}-01-01`);
      url.searchParams.set('end_date', `${params.year}-12-31`);
    }

    url.searchParams.set('page', String(params.page || 1));
    url.searchParams.set('order_by', 'popularity');
    url.searchParams.set('sfw', 'true');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.status}`);
    }
    const json = await response.json();
    return {
      results: (json.data || []).map((item: any) => this.mapAnime(item)),
      hasNextPage: !!json.pagination?.has_next_page,
    };
  }

  private async searchBySeason(
    year: number,
    season: string,
    params: AnimeSearchParams
  ): Promise<{ results: AnimeResult[]; hasNextPage: boolean }> {
    const url = new URL(`${JIKAN_BASE}/seasons/${year}/${season}`);
    url.searchParams.set('page', String(params.page || 1));
    if (params.genre) {
      url.searchParams.set('filter', params.genre);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.status}`);
    }
    const json = await response.json();
    let results: AnimeResult[] = (json.data || []).map((item: any) => this.mapAnime(item));

    if (params.query) {
      const q = params.query.toLowerCase();
      results = results.filter((r) => r.title.toLowerCase().includes(q));
    }

    return {
      results,
      hasNextPage: !!json.pagination?.has_next_page,
    };
  }

  private mapAnime(item: any): AnimeResult {
    return {
      malId: item.mal_id,
      title: item.title,
      imageUrl: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
      synopsis: item.synopsis || 'No synopsis available.',
      score: item.score ?? null,
      episodes: item.episodes ?? null,
      status: item.status || 'Unknown',
      year: item.year ?? item.aired?.prop?.from?.year ?? null,
      season: item.season ?? null,
      genres: (item.genres || []).map((g: any) => g.name),
      url: item.url,
    };
  }
}
