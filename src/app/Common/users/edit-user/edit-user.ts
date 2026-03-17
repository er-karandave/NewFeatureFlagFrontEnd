import { Component, computed, inject, signal } from '@angular/core';
import { Role } from '../../role/role-list/role-list';
import { Region } from '../../region/region-list/region-list';
import { User } from '../user-list/user-list';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../Services/user-service';
import { RoleService } from '../../../Services/role-service';
import { RegionService } from '../../../Services/region-service';
import { forkJoin } from 'rxjs';
import { FeaturesService, PermissionBreakdown, UserPermissionsResponse } from '../../../Services/features-service';

@Component({
  selector: 'app-edit-user',
  standalone: false,
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css',
})
export class EditUser {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  userService = inject(UserService);
  private permissionService = inject(FeaturesService);

  userId = signal(0);
  isInitialized = signal(false);
  roleName = signal<string>('');

  firstName = signal('');
  lastName = signal('');
  email = signal('');
  userRole = signal('');
  dob = signal('');
  region = signal('');

  userPermissions = signal<UserPermissionsResponse | null>(null);
  permissionsLoading = signal(false);
  selectedBreakdownFeature = signal<PermissionBreakdown | null | any>(null);
  userRoles = this.userService.userRoles;
  regions = this.userService.regions;
  dropdownLoading = this.userService.dropdownLoading;
  currentUser = this.userService.currentUser;
  userLoading = this.userService.loading;
  userError = this.userService.error;
  saving = this.userService.saving;

  isLoading = computed(() => {
    return this.userLoading();
  });

  hasError = computed(() => {
    return this.userError() !== null;
  });

  hasValidUser = computed(() => {
    return this.userId() > 0 && this.currentUser() !== null;
  });
  grantedPermissionsCount = computed(() => {
    return this.userPermissions()?.effectivePermissions.filter(p => p.isGranted).length || 0;
  });

  deniedPermissionsCount = computed(() => {
    return this.userPermissions()?.effectivePermissions.filter(p => !p.isGranted).length || 0;
  });

  totalFeaturesCount = computed(() => {
    return this.userPermissions()?.effectivePermissions.length || 0;
  });

  isFormDirty = computed(() => {
    const current = this.currentUser();
    if (!current) return false;
    return (
      this.firstName() !== current.firstName ||
      this.lastName() !== current.lastName ||
      this.email() !== current.email ||
      this.roleName() !== (current.roleName || '')
    );
  });

  selectedRoleName = computed(() => {
    return this.roleName() || 'No Role';
  });

  canSave = computed(() => this.isFormDirty() && !this.saving() && this.hasValidUser());
  isRoleInOptions = computed(() => {
    return this.userRole() && this.userRoles().includes(this.userRole());
  });

  isRegionInOptions = computed(() => {
    return this.region() && this.regions().includes(this.region());
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.userId.set(+idParam);
        this.loadData();
      } else {
        this.router.navigate(['/users']);
      }
    });
  }

  loadData(): void {
    if (this.isInitialized()) {
      return;
    }
    this.isInitialized.set(true);
    forkJoin({
      user: this.userService.getUserById(this.userId()),
      roles: this.userService.loadUserRolesObservable(),
      regions: this.userService.loadRegionsObservable()
    }).subscribe({
      next: () => {
        this.populateForm();
        this.loadUserPermissions();
      },
      error: (error) => {
        console.error('Failed to load edit user data:', error);
      }
    });

    this.userService.loadUserRoles();
    this.userService.loadRegions();
  }

  loadUserPermissions(): void {
    const user = this.currentUser();
    if (!user) return;

    this.permissionsLoading.set(true);

    this.permissionService.getUserPermissions(
      user.id,
      user.userRole || '',
      user.region || ''
    ).subscribe({
      next: (permissions) => {
        this.userPermissions.set(permissions);
        this.permissionsLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load permissions:', error);
        this.permissionsLoading.set(false);
      }
    });
  }

  viewBreakdown(featureId: number): void {
    const user = this.currentUser();
    if (!user) return;

    this.permissionService.getPermissionBreakdown(
      user.id,
      featureId,
      user.userRole || '',
      user.region || ''
    ).subscribe({
      next: (breakdown) => {
        this.selectedBreakdownFeature.set(breakdown);
      }
    });
  }

  togglePermission(
    featureId: number,
    accessLevel: 'USER' | 'ROLE' | 'COUNTRY' | 'GLOBAL',
    accessId: string,
    currentVal: boolean
  ): void {
    const newVal = !currentVal;

    this.permissionService.upsertPermission(
      featureId,
      accessLevel,
      accessId,
      newVal
    ).subscribe({
      next: () => {
        this.loadUserPermissions();
        if (this.selectedBreakdownFeature()) {
          this.viewBreakdown(featureId);
        }
      }
    });
  }


  onRoleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.roleName.set(value);
  }

  populateForm(): void {
    const user = this.currentUser();
    if (user && this.isInitialized()) {
      this.firstName.set(user.firstName);
      this.lastName.set(user.lastName);
      this.email.set(user.email);
      this.roleName.set(user.roleName || '');
    }
  }

  onFirstNameChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.firstName.set(value);
  }

  onLastNameChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.lastName.set(value);
  }

  onEmailChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.email.set(value);
  }

  onUserRoleChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.userRole.set(value);
  }

  onDobChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dob.set(value);
  }

  onRegionChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.region.set(value);
  }

  saveChanges(): void {
    if (!this.canSave()) return;
    this.userService.setSaving(true);

    const updatedUser: User = {
      id: this.userId(),
      firstName: this.firstName(),
      lastName: this.lastName(),
      email: this.email(),
      userRole: this.userRole(),
      dob: this.dob() || undefined,
      region: this.region()
    };

    this.userService.updateUser(updatedUser).subscribe({
      next: () => {
        this.userService.setSaving(false);
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.userService.setSaving(false);
        this.userService.errorSignal.set(error.message || 'Failed to save user');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  cancelChanges(): void {
    this.populateForm();
  }

}
