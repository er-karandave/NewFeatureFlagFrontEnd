import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegionService } from '../../../Services/region-service';
import { Region } from '../region-list/region-list';
import { FeaturesService, PermissionBreakdown } from '../../../Services/features-service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-edit-region',
  standalone: false,
  templateUrl: './edit-region.html',
  styleUrl: './edit-region.css',
})
export class EditRegion {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  regionService = inject(RegionService);

  private featureService = inject(FeaturesService);
  regionName = signal('');
  isInitialized = signal(false);
  regionPermissions = signal<PermissionBreakdown[] | null>(null);
  permissionsLoading = signal(false);
  selectedBreakdownFeature = signal<PermissionBreakdown | null>(null);
  currentRegion = this.regionService.currentRegion;
  regionLoading = this.regionService.loading;
  regionError = this.regionService.error;
  saving = this.regionService.saving;
  isLoading = computed(() => {
    return this.regionLoading() || this.permissionsLoading();
  });

  hasError = computed(() => {
    return this.regionError() !== null;
  });

  hasValidRegion = computed(() => {
    return this.regionName().length > 0;
  });

  grantedPermissionsCount = computed(() => {
    const permissions = this.regionPermissions();
    if (!permissions || !Array.isArray(permissions)) {
      return 0;
    }
    return permissions.filter(p => p?.effectivePermission).length;
  });

  deniedPermissionsCount = computed(() => {
    const permissions = this.regionPermissions();
    if (!permissions || !Array.isArray(permissions)) {
      return 0;
    }
    return permissions.filter(p => !p?.effectivePermission).length;
  });

  totalFeaturesCount = computed(() => {
    const permissions = this.regionPermissions();
    if (!permissions || !Array.isArray(permissions)) {
      return 0;
    }
    return permissions.length;
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const regionNameParam = params['region'];
      if (regionNameParam) {
        this.regionName.set(regionNameParam);
        this.loadData();
      } else {
        this.router.navigate(['/regions']);
      }
    });
  }

  loadData(): void {
    if (this.isInitialized()) {
      return;
    }
    this.isInitialized.set(true);

    forkJoin({
      region: this.regionService.getRegionByNameObservable(this.regionName()),
      features: this.featureService.loadFeaturesObservable()
    }).subscribe({
      next: () => {
        console.log('✅ All base data loaded');
        this.loadRegionPermissions();
      },
      error: (error) => {
        console.error('❌ Failed to load edit region data:', error);
      }
    });
  }

  loadRegionPermissions(): void {
    const region = this.currentRegion();
    if (!region) {
      console.log('⏳ currentRegion not ready yet');
      return;
    }

    this.permissionsLoading.set(true);

    this.featureService.getRegionPermissions(region.regionName).subscribe({
      next: (response) => {
        console.log('✅ Region permissions API response:', response);
        const permissionsArray = Array.isArray(response)
          ? response
          : response?.permissionBreakdown || [];

        this.regionPermissions.set(permissionsArray);
        this.permissionsLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Failed to load permissions:', error);
        this.regionPermissions.set([]);
        this.permissionsLoading.set(false);
      }
    });
  }

  // togglePermission(
  //   featureId: number,
  //   accessLevel: 'USER' | 'ROLE' | 'COUNTRY' | 'GLOBAL',
  //   accessId: string,
  //   currentVal: boolean
  // ): void {
  //   const newVal = !currentVal;

  //   this.featureService.upsertPermission(
  //     featureId,
  //     accessLevel,
  //     accessId,
  //     newVal
  //   ).subscribe({
  //     next: () => {
  //       this.loadRegionPermissions();
  //       if (this.selectedBreakdownFeature()) {
  //         this.viewBreakdown(featureId);
  //       }
  //     }
  //   });
  // }

  togglePermission(
    featureId: number,
    accessLevel: 'COUNTRY' | 'GLOBAL',
    accessId: string,
    currentVal: boolean
  ): void {
    const newVal = !currentVal;

    this.featureService.upsertPermission(
      featureId,
      accessLevel,
      accessId,
      newVal
    ).subscribe({
      next: () => {
        this.loadRegionPermissions();
        if (this.selectedBreakdownFeature()) {
          this.viewBreakdown(featureId);
        }
      }
    });
  }

  viewBreakdown(featureId: number): void {
    const region = this.currentRegion();
    if (!region) return;

    this.featureService.getPermissionBreakdownForRegion(
      featureId,
      region.regionName
    ).subscribe({
      next: (breakdown) => {
        this.selectedBreakdownFeature.set(breakdown);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/regions']);
  }

}
