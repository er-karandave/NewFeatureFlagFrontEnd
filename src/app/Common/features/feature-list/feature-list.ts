import { Component, computed, inject, signal } from '@angular/core';
import { FeaturesService } from '../../../Services/features-service';
import { ActivatedRoute, Router } from '@angular/router';


export interface Feature {
  id: number;
  featureName: string;
  featureDesc: string;
  featureCode: string;
  isActive: boolean;
  createdDate?: string;
  assignedRolesCount?: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  hasFeaturePermission: boolean;
}

export interface Role {
  id: number;
  roleName: string;
  description?: string;
  hasFeaturePermission: boolean;
}

export interface Region {
  id: number;
  regionName: string;
  regionCode: string;
  hasFeaturePermission: boolean;
}

export enum FilterType {
  All = 'all',
  WithPermission = 'with',
  WithoutPermission = 'without'
}

@Component({
  selector: 'app-feature-list',
  standalone: false,
  templateUrl: './feature-list.html',
  styleUrl: './feature-list.css',
})
export class FeatureList {
  featureService = inject(FeaturesService);
  private router = inject(Router);

  searchQuery = signal<string>('');

  features = this.featureService.features;
  loading = this.featureService.loading;
  error = this.featureService.error;

  totalFeatures = computed(() => {
    return this.features().length;
  });

  activeFeaturesCount = computed(() => {
    const featuresList = this.features();
    return featuresList.filter(feature => feature.isActive).length;
  });

  inactiveFeaturesCount = computed(() => {
    const featuresList = this.features();
    return featuresList.filter(feature => !feature.isActive).length;
  });

  totalAssignments = computed(() => {
    const featuresList = this.features();
    return featuresList.reduce((sum, feature) => sum + (feature.assignedRolesCount || 0), 0);
  });

  displayFeatures = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const featuresList = this.features();

    if (!query) {
      return featuresList;
    }

    return featuresList.filter(feature => {
      const nameMatch = feature.featureName.toLowerCase().includes(query);
      const codeMatch = feature.featureCode.toLowerCase().includes(query);
      const descMatch = feature.featureDesc.toLowerCase().includes(query);
      return nameMatch || codeMatch || descMatch;
    });
  });

  displayFeaturesCount = computed(() => {
    return this.displayFeatures().length;
  });

  hasError = computed(() => {
    return this.error() !== null;
  });

  isLoading = computed(() => {
    return this.loading() === true;
  });

  ngOnInit(): void {
    this.featureService.loadFeatures();
  }

  onSearchChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
  }

  editFeature(featureId: number): void {
    this.router.navigate(['/features/edit'], {
      queryParams: { feature: featureId }
    });
  }

  refresh(): void {
    this.featureService.loadFeatures();
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  trackByFeatureId(index: number, feature: Feature): number {
    return feature.id;
  }

}
