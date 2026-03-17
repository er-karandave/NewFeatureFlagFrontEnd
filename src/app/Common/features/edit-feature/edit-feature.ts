import { Component, computed, inject, signal } from '@angular/core';
import { Feature, FilterType } from '../feature-list/feature-list';
import { ActivatedRoute, Router } from '@angular/router';
import { FeaturesService } from '../../../Services/features-service';

@Component({
  selector: 'app-edit-feature',
  standalone: false,
  templateUrl: './edit-feature.html',
  styleUrl: './edit-feature.css',
})
export class EditFeature {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  featureService = inject(FeaturesService);
  filterType = FilterType;
  featureId = signal<number>(0);
  isInitialized = signal<boolean>(false);
  featureName = signal<string>('');
  featureCode = signal<string>('');
  featureDesc = signal<string>('');
  isActive = signal<boolean>(true);
  userFilter = signal<FilterType>(FilterType.All);
  roleFilter = signal<FilterType>(FilterType.All);
  regionFilter = signal<FilterType>(FilterType.All);
  currentFeature = this.featureService.currentFeature;
  users = this.featureService.users;
  roles = this.featureService.roles;
  regions = this.featureService.regions;
  featureLoading = this.featureService.loading;
  featureError = this.featureService.error;
  saving = this.featureService.saving;

  isLoading = computed(() => this.featureLoading());

  hasError = computed(() => this.featureError() !== null);

  hasValidFeature = computed(() => this.featureId() > 0 && this.currentFeature() !== null);

  isFormDirty = computed(() => {
    const current = this.currentFeature();
    if (!current) return false;
    return (
      this.featureName() !== current.featureName ||
      this.featureCode() !== current.featureCode ||
      this.featureDesc() !== current.featureDesc ||
      this.isActive() !== current.isActive
    );
  });

  canSave = computed(() => this.isFormDirty() && !this.saving() && this.hasValidFeature());

  filteredUsers = computed(() => {
    const usersList = this.users();
    const filter = this.userFilter();
    
    if (filter === FilterType.WithPermission) {
      return usersList.filter(u => u.hasFeaturePermission);
    } else if (filter === FilterType.WithoutPermission) {
      return usersList.filter(u => !u.hasFeaturePermission);
    }
    return usersList;
  });

  usersWithPermissionCount = computed(() => 
    this.users().filter(u => u.hasFeaturePermission).length
  );

  usersWithoutPermissionCount = computed(() => 
    this.users().filter(u => !u.hasFeaturePermission).length
  );

  filteredRoles = computed(() => {
    const rolesList = this.roles();
    const filter = this.roleFilter();
    
    if (filter === FilterType.WithPermission) {
      return rolesList.filter(r => r.hasFeaturePermission);
    } else if (filter === FilterType.WithoutPermission) {
      return rolesList.filter(r => !r.hasFeaturePermission);
    }
    return rolesList;
  });

  rolesWithPermissionCount = computed(() => 
    this.roles().filter(r => r.hasFeaturePermission).length
  );

  rolesWithoutPermissionCount = computed(() => 
    this.roles().filter(r => !r.hasFeaturePermission).length
  );

  filteredRegions = computed(() => {
    const regionsList = this.regions();
    const filter = this.regionFilter();
    
    if (filter === FilterType.WithPermission) {
      return regionsList.filter(r => r.hasFeaturePermission);
    } else if (filter === FilterType.WithoutPermission) {
      return regionsList.filter(r => !r.hasFeaturePermission);
    }
    return regionsList;
  });

  regionsWithPermissionCount = computed(() => 
    this.regions().filter(r => r.hasFeaturePermission).length
  );

  regionsWithoutPermissionCount = computed(() => 
    this.regions().filter(r => !r.hasFeaturePermission).length
  );

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const featureIdParam = params['feature'];
      if (featureIdParam) {
        this.featureId.set(+featureIdParam);
        this.loadData();
      } else {
        this.router.navigate(['/features']);
      }
    });
  }

  loadData(): void {
    if (this.isInitialized()) return;
    this.isInitialized.set(true);
    this.featureService.getFeatureById(this.featureId());
    this.featureService.getFeatureUsers(this.featureId());
    this.featureService.getFeatureRoles(this.featureId());
    this.featureService.getFeatureRegions(this.featureId());
  }

  populateForm(): void {
    const feature = this.currentFeature();
    if (feature && this.isInitialized()) {
      this.featureName.set(feature.featureName);
      this.featureCode.set(feature.featureCode);
      this.featureDesc.set(feature.featureDesc);
      this.isActive.set(feature.isActive);
    }
  }

  onFeatureNameChange(event: Event): void {
    this.featureName.set((event.target as HTMLInputElement).value);
  }

  onFeatureCodeChange(event: Event): void {
    this.featureCode.set((event.target as HTMLInputElement).value);
  }

  onFeatureDescChange(event: Event): void {
    this.featureDesc.set((event.target as HTMLTextAreaElement).value);
  }

  onIsActiveChange(event: Event): void {
    this.isActive.set((event.target as HTMLInputElement).checked);
  }

  onUserFilterChange(event: Event): void {
    this.userFilter.set((event.target as HTMLSelectElement).value as FilterType);
  }

  onRoleFilterChange(event: Event): void {
    this.roleFilter.set((event.target as HTMLSelectElement).value as FilterType);
  }

  onRegionFilterChange(event: Event): void {
    this.regionFilter.set((event.target as HTMLSelectElement).value as FilterType);
  }

  toggleUserPermission(userId: number, currentPermission: boolean): void {
    this.featureService.toggleUserPermission(
      this.featureId(), 
      userId, 
      !currentPermission
    ).subscribe({
      next: () => {
        const updated = this.users().map(u => 
          u.id === userId ? { ...u, hasFeaturePermission: !currentPermission } : u
        );
        this.featureService.usersSignal.set(updated);
      }
    });
  }

  toggleRolePermission(roleId: number, currentPermission: boolean): void {
    this.featureService.toggleRolePermission(
      this.featureId(), 
      roleId, 
      !currentPermission
    ).subscribe({
      next: () => {
        const updated = this.roles().map(r => 
          r.id === roleId ? { ...r, hasFeaturePermission: !currentPermission } : r
        );
        this.featureService.rolesSignal.set(updated);
      }
    });
  }

  toggleRegionPermission(regionId: number, currentPermission: boolean): void {
    this.featureService.toggleRegionPermission(
      this.featureId(), 
      regionId, 
      !currentPermission
    ).subscribe({
      next: () => {
        const updated = this.regions().map(r => 
          r.id === regionId ? { ...r, hasFeaturePermission: !currentPermission } : r
        );
        this.featureService.regionsSignal.set(updated);
      }
    });
  }

  saveChanges(): void {
    if (!this.canSave()) return;
    this.featureService.setSaving(true);

    const updatedFeature: Feature = {
      id: this.featureId(),
      featureName: this.featureName(),
      featureCode: this.featureCode(),
      featureDesc: this.featureDesc(),
      isActive: this.isActive(),
      createdDate: this.currentFeature()?.createdDate,
      assignedRolesCount: this.currentFeature()?.assignedRolesCount
    };

    this.featureService.updateFeature(updatedFeature).subscribe({
      next: () => {
        this.featureService.setSaving(false);
        this.router.navigate(['/features']);
      },
      error: (error) => {
        this.featureService.setSaving(false);
        this.featureService.errorSignal.set(error.message || 'Failed to save feature');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/features']);
  }

  cancelChanges(): void {
    this.populateForm();
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

}
