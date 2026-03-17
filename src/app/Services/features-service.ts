import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Feature, Region, Role, User } from '../Common/features/feature-list/feature-list';
import { catchError, Observable, tap, throwError } from 'rxjs';


export interface EffectivePermission {
  featureId: number;
  featureName: string;
  featureCode: string;
  isGranted: boolean;
  grantedAtLevel: 'USER' | 'ROLE' | 'COUNTRY' | 'GLOBAL' | 'DEFAULT';
  grantedAtId: string;
}

export interface PermissionBreakdown {
  featureId: number;
  featureName: string;
  featureCode: string;
  userLevel: boolean;  
  roleLevel: boolean;
  regionLevel: boolean;
  globalLevel: boolean;
  effectivePermission: boolean;
}

export interface UserPermissionsResponse {
  userId: number;
  userName: string;
  userRole: string;
  userRegion: string;
  effectivePermissions: EffectivePermission[];
  permissionBreakdown: PermissionBreakdown[];
}

export interface RolePermissionsResponseDto {
  roleName: string;
  permissionBreakdown: PermissionBreakdown[];
}

export interface RolePermissionBreakdown {
  featureId: number;
  featureName: string;
  featureCode: string;
  roleLevel: boolean;      
  regionLevel: boolean;    
  globalLevel: boolean;
  effectivePermission: boolean;
}


@Injectable({
  providedIn: 'root',
})
export class FeaturesService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7237/api';

  private featuresSignal = signal<Feature[]>([]);
  private currentFeatureSignal = signal<Feature | null>(null);
  usersSignal = signal<User[]>([]);
  rolesSignal = signal<Role[]>([]);
  regionsSignal = signal<Region[]>([]);
  private loadingSignal = signal<boolean>(false);
  errorSignal = signal<string | null>(null);
  private savingSignal = signal<boolean>(false);

  features = computed(() => this.featuresSignal());
  currentFeature = computed(() => this.currentFeatureSignal());
  users = computed(() => this.usersSignal());
  roles = computed(() => this.rolesSignal());
  regions = computed(() => this.regionsSignal());
  loading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());
  saving = computed(() => this.savingSignal());


  // loadFeatures(): void {
  //   this.loadingSignal.set(true);
  //   this.errorSignal.set(null);

  //   this.http.post<any[]>(this.apiUrl + '/Feature', {}).subscribe({
  //     next: (data) => {
  //       this.featuresSignal.set(data);
  //       this.loadingSignal.set(false);
  //     },
  //     error: (error: HttpErrorResponse) => {
  //       this.errorSignal.set(error.message || 'Failed to load features');
  //       this.loadingSignal.set(false);
  //     }
  //   });
  // }

  loadFeatures(): void {
  this.loadFeaturesObservable().subscribe();
}


  getFeatureById(id: number): void {
    this.loadingSignal.set(true);
    this.http.get<Feature>(`${this.apiUrl}/${id}`).subscribe({
      next: (feature) => {
        this.currentFeatureSignal.set(feature);
        this.loadingSignal.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorSignal.set(error.message || 'Failed to load feature');
        this.loadingSignal.set(false);
      }
    });
  }

  getFeatureUsers(featureId: number): void {
    this.http.get<User[]>(`${this.apiUrl}/${featureId}/users`).subscribe({
      next: (data) => {
        this.usersSignal.set(data);
      }
    });
  }

  getUserPermissions(userId: number, role: string, region: string): Observable<UserPermissionsResponse> {
    return this.http.get<UserPermissionsResponse>(
      `${this.apiUrl}/feature/user/${userId}`,
      { params: { role, region } }
    );
  }

  getPermissionBreakdown(
    userId: number,
    featureId: number,
    role: string,
    region: string
  ): Observable<PermissionBreakdown> {
    return this.http.get<PermissionBreakdown>(
      `${this.apiUrl}/feature/user/${userId}/feature/${featureId}`,
      { params: { role, region } }
    );
  }

  getFeatureRoles(featureId: number): void {
    this.http.get<Role[]>(`${this.apiUrl}/${featureId}/roles`).subscribe({
      next: (data) => {
        this.rolesSignal.set(data);
      }
    });
  }

  getFeatureRegions(featureId: number): void {
    this.http.get<Region[]>(`${this.apiUrl}/${featureId}/regions`).subscribe({
      next: (data) => {
        this.regionsSignal.set(data);
      }
    });
  }

  toggleUserPermission(featureId: number, userId: number, grant: boolean): Observable<void> {
    if (grant) {
      return this.http.post<void>(`${this.apiUrl}/${featureId}/users/${userId}`, {});
    } else {
      return this.http.delete<void>(`${this.apiUrl}/${featureId}/users/${userId}`);
    }
  }

  toggleRolePermission(featureId: number, roleId: number, grant: boolean): Observable<void> {
    if (grant) {
      return this.http.post<void>(`${this.apiUrl}/${featureId}/roles/${roleId}`, {});
    } else {
      return this.http.delete<void>(`${this.apiUrl}/${featureId}/roles/${roleId}`);
    }
  }

  toggleRegionPermission(featureId: number, regionId: number, grant: boolean): Observable<void> {
    if (grant) {
      return this.http.post<void>(`${this.apiUrl}/${featureId}/regions/${regionId}`, {});
    } else {
      return this.http.delete<void>(`${this.apiUrl}/${featureId}/regions/${regionId}`);
    }
  }

  updateFeature(feature: Feature): Observable<Feature> {
    return this.http.put<Feature>(`${this.apiUrl}/${feature.id}`, feature);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  setSaving(value: boolean): void {
    this.savingSignal.set(value);
  }

  upsertPermission(
    featureId: number,
    accessLevel: 'USER' | 'ROLE' | 'COUNTRY' | 'GLOBAL',
    accessId: string,
    val: boolean
  ): Observable<void> {
    return this.http.post<void>(this.apiUrl + '/feature', {
      featureId,
      accessLevel,
      accessId,
      val
    });
  }

  deletePermission(permissionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${permissionId}`);
  }

  getRolePermissions(roleName: string): Observable<RolePermissionsResponseDto> {
    return this.http.get<RolePermissionsResponseDto>(
      `${this.apiUrl}/feature/role/${encodeURIComponent(roleName)}`
    );
  }

  getPermissionBreakdownForRole(
    featureId: number,
    roleName: string
  ): Observable<PermissionBreakdown> {
    return this.http.get<PermissionBreakdown>(
      `${this.apiUrl}/feature/role/${encodeURIComponent(roleName)}/feature/${featureId}`
    );
  }

  loadFeaturesObservable(): Observable<Feature[]> {
    this.loadingSignal.set(true);
    return this.http.post<Feature[]>(this.apiUrl + '/Feature', {}).pipe(
      tap((data) => {
        this.featuresSignal.set(data);
        this.loadingSignal.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorSignal.set(error.message || 'Failed to load features');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  getRolePermissionsObservable(roleName: string): Observable<RolePermissionsResponseDto> {
  return this.http.get<RolePermissionsResponseDto>(
    `${this.apiUrl}/feature/role/${encodeURIComponent(roleName)}`
  );
}

getRegionPermissions(regionName: string): Observable<RolePermissionsResponseDto> {
  return this.http.get<RolePermissionsResponseDto>(
    `${this.apiUrl}/feature/region/${encodeURIComponent(regionName)}`
  );
}

getPermissionBreakdownForRegion(featureId: number, regionName: string): Observable<PermissionBreakdown> {
  return this.http.get<PermissionBreakdown>(
    `${this.apiUrl}/feature/region/${encodeURIComponent(regionName)}/feature/${featureId}`
  );
}


}
