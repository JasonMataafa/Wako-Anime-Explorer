import { Component, OnInit } from '@angular/core';
import { AnimeService, AnimeResult, ANIME_GENRES, ANIME_SEASONS } from '../services/anime.service';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = Array.from({ length: CURRENT_YEAR - 1959 }, (_, i) => CURRENT_YEAR - i);

@Component({
  selector: 'app-plugin-detail',
  templateUrl: './plugin-detail.component.html',
  styleUrls: ['./plugin-detail.component.scss'],
  providers: [AnimeService],
})
export class PluginDetailComponent implements OnInit {
  query = '';
  selectedGenre: string | null = null;
  selectedSeason: string | null = null;
  selectedYear: number | null = null;
  selectedStatus: string | null = null;

  genres = ANIME_GENRES;
  seasons = ANIME_SEASONS;
  years = YEAR_RANGE;
  statuses = [
    { value: 'airing', label: 'Airing' },
    { value: 'complete', label: 'Completed' },
    { value: 'upcoming', label: 'Upcoming' },
  ];

  results: AnimeResult[] = [];
  loading = false;
  errorMessage: string | null = null;
  hasSearched = false;
  page = 1;
  hasNextPage = false;

  private debounceHandle: any;

  constructor(private animeService: AnimeService) {}

  ngOnInit() {}

  onQueryChange() {
    clearTimeout(this.debounceHandle);
    this.debounceHandle = setTimeout(() => this.runSearch(true), 450);
  }

  toggleGenre(genreId: number) {
    const value = String(genreId);
    this.selectedGenre = this.selectedGenre === value ? null : value;
    this.runSearch(true);
  }

  toggleSeason(season: string) {
    this.selectedSeason = this.selectedSeason === season ? null : season;
    this.runSearch(true);
  }

  toggleStatus(status: string) {
    this.selectedStatus = this.selectedStatus === status ? null : status;
    this.runSearch(true);
  }

  onYearChange(year: number | null) {
    this.selectedYear = year;
    this.runSearch(true);
  }

  clearFilters() {
    this.selectedGenre = null;
    this.selectedSeason = null;
    this.selectedYear = null;
    this.selectedStatus = null;
    this.query = '';
    this.runSearch(true);
  }

  async runSearch(reset: boolean) {
    if (reset) {
      this.page = 1;
      this.results = [];
    }
    this.loading = true;
    this.errorMessage = null;
    this.hasSearched = true;

    try {
      const response = await this.animeService.search({
        query: this.query || undefined,
        genre: this.selectedGenre || undefined,
        season: this.selectedSeason || undefined,
        year: this.selectedYear || undefined,
        status: this.selectedStatus || undefined,
        page: this.page,
      });

      this.results = reset ? response.results : [...this.results, ...response.results];
      this.hasNextPage = response.hasNextPage;
    } catch (err) {
      this.errorMessage = 'Could not reach the anime database. Check your connection and try again.';
    } finally {
      this.loading = false;
    }
  }

  loadMore() {
    this.page += 1;
    this.runSearch(false);
  }

  trackByMalId(index: number, item: AnimeResult) {
    return item.malId;
  }
}
