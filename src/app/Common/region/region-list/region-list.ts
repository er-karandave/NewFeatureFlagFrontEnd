import { Component, computed, inject, signal } from '@angular/core';
import { RegionService } from '../../../Services/region-service';
import { Router } from '@angular/router';

export interface Region {
  regionName: string;
}

export interface RegionApiResponse {
  data: Region[];
  totalCount: number;
  success: boolean;
  message?: string;
}

@Component({
  selector: 'app-region-list',
  standalone: false,
  templateUrl: './region-list.html',
  styleUrl: './region-list.css',
})
export class RegionList {

  regionService = inject(RegionService);
  private router = inject(Router);
  searchQuery = signal<string>('');
  regions = this.regionService.regions;
  loading = this.regionService.loading;
  error = this.regionService.error;
  totalRegions = computed(() => {
    return this.regions().length;
  });
  displayRegions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const regionsList = this.regions();

    if (!query) {
      return regionsList;
    }

    return regionsList.filter(region => {
      return region.regionName.toLowerCase().includes(query);
    });
  });

  displayRegionsCount = computed(() => {
    return this.displayRegions().length;
  });

  hasError = computed(() => {
    return this.error() !== null;
  });

  isLoading = computed(() => {
    return this.loading() === true;
  });


  ngOnInit(): void {
    this.regionService.loadRegions();
  }

  onSearchChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
  }

  editRegion(regionName: string): void {
    this.router.navigate(['/regions/edit-region'], {
      queryParams: { region: regionName }
    });
  }

  refresh(): void {
    this.regionService.loadRegions();
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  trackByRegionName(index: number, region: Region): string {
    return region.regionName;
  }

}
