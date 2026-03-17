import { Component, computed, inject, signal } from '@angular/core';
import { RoleService } from '../../../Services/role-service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../Services/user-service';
import { FeaturesService, PermissionBreakdown } from '../../../Services/features-service';
import { User } from '../../users/user-list/user-list';
import { Feature } from '../../features/feature-list/feature-list';
import { forkJoin } from 'rxjs';


export interface RoleFeature {
  id: number;
  roleName: string;
  featureId: number;
  isGranted: boolean;
  feature?: Feature;
}

@Component({
  selector: 'app-edit-role',
  standalone: false,
  templateUrl: './edit-role.html',
  styleUrl: './edit-role.css',
})
export class EditRole {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  roleService = inject(RoleService);
  private userService = inject(UserService);
  private featureService = inject(FeaturesService);
  roleName = signal('');
  isInitialized = signal(false);
  roleFeaturesSignal = signal<RoleFeature[]>([]);
  userFilter = signal('all');
  featureFilter = signal('all');
  rolePermissions = signal<PermissionBreakdown[] | null>(null);
  permissionsLoading = signal(false);
  selectedBreakdownFeature = signal<PermissionBreakdown | null>(null);
  currentRole = this.roleService.currentRole;
  roleLoading = this.roleService.loading;
  roleError = this.roleService.error;
  users = this.userService.users;
  features = this.featureService.features;
  saving = this.roleService.saving;
  isLoading = computed(() => {
    return this.roleLoading();
  });

  hasError = computed(() => {
    return this.roleError() !== null;
  });

  hasValidRole = computed(() => {
    return this.roleName().length > 0 && this.currentRole() !== null;
  });
  usersWithThisRole = computed(() => {
    const role = this.currentRole();
    if (!role) return [];
    return this.users().filter(user => user.userRole === role.roleName);
  });

  assignedUsers = computed(() => {
    const role = this.currentRole();
    if (!role) return [];
    return this.users().filter(user => user.userRole === role.roleName);
  });

  usersWithThisRoleCount = computed(() => this.usersWithThisRole().length);

  usersWithoutThisRole = computed(() => {
    const role = this.currentRole();
    if (!role) return [];
    return this.users().filter(user => user.userRole !== role.roleName);
  });

  filteredUsers = computed(() => {
    const filter = this.userFilter();
    console.log('Filtering users with filter:', filter);
    if (filter === 'with-role') {
      return this.usersWithThisRole();
    } else if (filter === 'without-role') {
      return this.usersWithoutThisRole();
    }
    return this.users();
  });

  enabledFeatures = computed(() => {
    const roleFeatures = this.roleFeaturesSignal();
    const allFeatures = this.features();
    if (!roleFeatures || !Array.isArray(roleFeatures)) {
      return [];
    }

    const enabledFeatureIds = roleFeatures
      .filter(rf => rf?.isGranted)
      .map(rf => rf?.featureId)
      .filter(id => id !== undefined);

    if (!allFeatures || !Array.isArray(allFeatures)) {
      return [];
    }

    return allFeatures.filter(f => f?.id && enabledFeatureIds.includes(f.id));
  });

  enabledFeaturesCount = computed(() => this.enabledFeatures().length);

  availableFeatures = computed(() => {
    const roleFeatures = this.roleFeaturesSignal();
    const allFeatures = this.features();

    if (!roleFeatures || !Array.isArray(roleFeatures) || !allFeatures || !Array.isArray(allFeatures)) {
      return [];
    }

    const enabledFeatureIds = roleFeatures
      .filter(rf => rf?.isGranted)
      .map(rf => rf?.featureId)
      .filter(id => id !== undefined);

    return allFeatures.filter(f => f?.id && !enabledFeatureIds.includes(f.id));
  });

  availableFeaturesCount = computed(() => this.availableFeatures().length);

  // filteredFeatures = computed(() => {
  //   const filter = this.featureFilter();
  //   console.log('Filtering features with filter:', filter);

  //   if (filter === 'enabled') {
  //     const enabled = this.enabledFeatures();
  //     return enabled || [];
  //   } else if (filter === 'available') {
  //     const available = this.availableFeatures();
  //     return available || [];
  //   }
  //   const all = this.features();
  //   return all || [];
  // });

  filteredFeatures = computed(() => {
    const filter = this.featureFilter();
    if (filter === 'enabled') {
      return this.enabledFeatures() || [];
    } else if (filter === 'available') {
      return this.availableFeatures() || [];
    }
    return this.features() || [];
  });

  canSave = computed(() => {
    return !this.saving() && this.hasValidRole();
  });

  // grantedPermissionsCount = computed(() => {
  //   const permissions = this.rolePermissions();
  //   if (!permissions || !Array.isArray(permissions)) {
  //     return 0;
  //   }
  //   return permissions.filter(p => p?.effectivePermission).length;
  // });

  grantedPermissionsCount = computed(() => {
    const permissions = this.rolePermissions();
    if (!permissions || !Array.isArray(permissions)) {
      return 0;
    }
    return permissions.filter(p => p?.effectivePermission).length;
  });

  // deniedPermissionsCount = computed(() => {
  //   const permissions = this.rolePermissions();
  //   if (!permissions || !Array.isArray(permissions)) {
  //     return 0;
  //   }
  //   return permissions.filter(p => !p?.effectivePermission).length;
  // });

  deniedPermissionsCount = computed(() => {
    const permissions = this.rolePermissions();
    if (!permissions || !Array.isArray(permissions)) {
      return 0;
    }
    return permissions.filter(p => !p?.effectivePermission).length;
  });


  // totalFeaturesCount = computed(() => {
  //   const permissions = this.rolePermissions();
  //   if (!permissions || !Array.isArray(permissions)) {
  //     return 0;
  //   }
  //   return permissions.length;
  // });

  totalFeaturesCount = computed(() => {
    const permissions = this.rolePermissions();
    if (!permissions || !Array.isArray(permissions)) {
      return 0;
    }
    return permissions.length;
  });

  ngOnInit(): void {
    this.currentRole = this.roleService.currentRole
    this.route.queryParams.subscribe(params => {
      const roleName = params['role'];
      if (roleName) {
        this.roleName.set(roleName);
        this.loadData();
      } else {
        this.router.navigate(['/roles']);
      }
    });
  }

  // loadData(): void {
  //   if (this.isInitialized()) {
  //     return;
  //   }
  //   this.isInitialized.set(true);

  //   this.roleService.getRoleByName(this.roleName());
  //   this.userService.loadUsers();
  //   this.featureService.loadFeatures();
  //   this.loadRoleFeatures();
  //   this.loadRolePermissions();  
  // }

  loadData(): void {
    if (this.isInitialized()) {
      return;
    }
    this.isInitialized.set(true);

    forkJoin({
      role: this.roleService.getRoleByNameObservable(this.roleName()),
      users: this.userService.loadUsersObservable(),
      features: this.featureService.loadFeaturesObservable()
    }).subscribe({
      next: () => {

        this.loadRoleFeatures();
        this.loadRolePermissions();
      },
      error: (error) => {
        console.error('❌ Failed to load edit role ', error);
      }
    });
  }


  loadRoleFeatures(): void {
    this.roleService.getRoleFeatures(this.roleName()).subscribe({
      next: (data) => {
        console.log('Role features API response:', data);

        const transformedData = Array.isArray(data)
          ? data.map(item => ({
            id: item.id || 0,
            roleName: item.roleName || this.roleName(),
            featureId: item.featureId,
            isGranted: item.isGranted === true
          }))
          : [];

        this.roleFeaturesSignal.set(transformedData);
      },
      error: (error) => {
        console.error('Failed to load role features:', error);
        this.roleFeaturesSignal.set([]);
      }
    });
  }

  // loadRolePermissions(): void {
  //   const role = this.currentRole();
  //   if (!role) return;

  //   this.permissionsLoading.set(true);

  //   this.featureService.getRolePermissions(
  //     role.roleName
  //   ).subscribe({
  //     next: (permissions) => {
  //       this.rolePermissions.set(permissions);
  //       this.permissionsLoading.set(false);
  //     },
  //     error: (error) => {
  //       console.error('Failed to load permissions:', error);
  //       this.permissionsLoading.set(false);
  //     }
  //   });
  // }

  loadRolePermissions(): void {
    const role = this.currentRole();
    if (!role) return;

    this.permissionsLoading.set(true);

    this.featureService.getRolePermissions(role.roleName).subscribe({
      next: (response) => {
        console.log('Role permissions API response:', response);

        const permissionsArray = Array.isArray(response)
          ? response
          : response?.permissionBreakdown || [];

        this.rolePermissions.set(permissionsArray);
        this.permissionsLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load permissions:', error);
        this.rolePermissions.set([]);
        this.permissionsLoading.set(false);
      }
    });
  }

  onUserFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.userFilter.set(value);
  }

  onFeatureFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.featureFilter.set(value);
  }

  // toggleFeaturePermission(featureId: number, isGranted: boolean): void {
  //   const currentRoleName = this.roleName(); 
  //   if (!currentRoleName) return;

  //   if (isGranted) {
  //     this.roleService.removeFeature(currentRoleName, featureId).subscribe({
  //       next: () => {
  //         const updated = this.roleFeaturesSignal().filter(rf => rf?.featureId !== featureId);
  //         this.roleFeaturesSignal.set(updated);
  //       }
  //     });
  //   } else {
  //     this.roleService.assignFeature(currentRoleName, featureId).subscribe({
  //       next: () => {
  //         const newRoleFeature: RoleFeature = {
  //           id: 0,
  //           roleName: currentRoleName,  
  //           featureId: featureId,
  //           isGranted: true
  //         };
  //         this.roleFeaturesSignal.set([...this.roleFeaturesSignal(), newRoleFeature]);
  //       }
  //     });
  //   }
  // }

  toggleFeaturePermission(featureId: number, isGranted: boolean): void {
    const currentRoleName = this.roleName();
    if (!currentRoleName) return;

    if (isGranted) {
      this.roleService.removeFeature(currentRoleName, featureId).subscribe({
        next: () => {
          const updated = this.roleFeaturesSignal().filter(rf => rf?.featureId !== featureId);
          this.roleFeaturesSignal.set(updated);
          this.loadRolePermissions();
        }
      });
    } else {
      this.roleService.assignFeature(currentRoleName, featureId).subscribe({
        next: () => {
          const newRoleFeature: RoleFeature = {
            id: 0,
            roleName: currentRoleName,
            featureId: featureId,
            isGranted: true
          };
          this.roleFeaturesSignal.set([...this.roleFeaturesSignal(), newRoleFeature]);
          this.loadRolePermissions();
        }
      });
    }
  }



  assignUser(userId: number): void {
    this.userService.assignUserToRole(userId, this.roleName()).subscribe({
      next: () => {
        this.userService.loadUsers();
      }
    });
  }

  removeUser(userId: number): void {
    this.userService.removeUserFromRole(userId).subscribe({
      next: () => {
        this.userService.loadUsers();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  trackByFeatureId(index: number, feature: Feature): number {
    return feature.id;
  }

  isFeatureEnabled(featureId: number): boolean {
    const enabled = this.enabledFeatures();
    if (!enabled || !Array.isArray(enabled)) {
      return false;
    }
    return enabled.some(f => f?.id === featureId);
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
  //       this.loadRoleFeatures();
  //       this.loadRolePermissions();
  //       if (this.selectedBreakdownFeature()) {
  //         this.viewBreakdown(featureId);
  //       }
  //     }
  //   });
  // }

  // viewBreakdown(featureId: number): void {
  //   const role = this.currentRole();
  //   if (!role) return;

  //   this.featureService.getPermissionBreakdownForRole(
  //     featureId,
  //     role.roleName
  //   ).subscribe({
  //     next: (breakdown) => {
  //       this.selectedBreakdownFeature.set(breakdown);
  //     }
  //   });
  // }

  viewBreakdown(featureId: number): void {
    const role = this.currentRole();
    if (!role) return;

    this.featureService.getPermissionBreakdownForRole(
      featureId,
      role.roleName
    ).subscribe({
      next: (breakdown) => {
        this.selectedBreakdownFeature.set(breakdown);
      }
    });
  }

  togglePermission(
    featureId: number,
    accessLevel: 'ROLE' | 'GLOBAL',
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
        this.loadRolePermissions();
        if (this.selectedBreakdownFeature()) {
          this.viewBreakdown(featureId);
        }
      }
    });
  }
}
