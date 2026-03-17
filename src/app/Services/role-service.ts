import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Role, RoleApiResponse } from '../Common/role/role-list/role-list';
import { catchError, Observable, tap, throwError } from 'rxjs';

export interface RoleFeature {
  id: number;
  roleId: number;
  featureId: number;
  isGranted: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7237/api'; // Your .NET Core API endpoint

  private rolesSignal = signal<Role[]>([]);
  private currentRoleSignal = signal<Role | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private savingSignal = signal<boolean>(false);

  roles = computed(() => this.rolesSignal());
  currentRole = computed(() => this.currentRoleSignal());
  loading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());
  saving = computed(() => this.savingSignal());

  loadRoles(): void {
    this.loadingSignal.set(true);
    this.http.get<RoleApiResponse>(this.apiUrl + '/Role').subscribe({
      next: (response) => {
        if (response.success) {
          this.rolesSignal.set(response.data);
        } else {
          this.errorSignal.set(response.message || 'Failed to load roles');
        }
        this.loadingSignal.set(false);
      },
      error: () => {
        this.loadingSignal.set(false);
      }
    });
  }

  getRoleById(roleName: string): void {
    this.loadingSignal.set(true);
    this.http.get<Role>(`${this.apiUrl}/${encodeURIComponent(roleName)}`).subscribe({
      next: (role) => {
        this.currentRoleSignal.set(role);
        this.loadingSignal.set(false);
      },
      error: () => {
        this.loadingSignal.set(false);
      }
    });
  }


  getRoleByName(roleName: string): void {
    this.getRoleByNameObservable(roleName).subscribe();
  }

  // getRoleFeatures(roleName: string): Observable<any[]> {
  //   // return this.http.get<any[]>(`${this.apiUrl}/feature/role/${encodeURIComponent(roleName)}/features`);
  //   return this.http.get<RoleFeature[]>(
  //     `${this.apiUrl}/feature/role/${encodeURIComponent(roleName)}/features`
  //   );
  // }

  assignFeature(roleName: string, featureId: number): Observable<void> {
    // return this.http.post<void>(`${this.apiUrl}/${encodeURIComponent(roleName)}/features/${featureId}`, {});
    return this.http.post<void>(
      `${this.apiUrl}/feature/role/${encodeURIComponent(roleName)}/features/${featureId}`,
      {}
    );
  }

  removeFeature(roleName: string, featureId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(roleName)}/features/${featureId}`);
  }

  updateRole(role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${role.roleName}`, role);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  setSaving(value: boolean): void {
    this.savingSignal.set(value);
  }

  getRoleFeaturesByName(roleName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Role/${encodeURIComponent(roleName)}`);
  }

  getRoleByNameObservable(roleName: string): Observable<Role> {
    this.loadingSignal.set(true);
    return this.http.get<Role>(`${this.apiUrl}/Role/${encodeURIComponent(roleName)}`).pipe(
      tap((role) => {
        this.currentRoleSignal.set(role);
        this.loadingSignal.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorSignal.set(error.message || 'Failed to load role');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  getRoleFeaturesObservable(roleName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/feature/role/${encodeURIComponent(roleName)}/features`);
  }


  assignFeatureByName(roleName: string, featureId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/Role/${encodeURIComponent(roleName)}/features/${featureId}`, {});
  }

  removeFeatureByName(roleName: string, featureId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Role/${encodeURIComponent(roleName)}/features/${featureId}`);
  }

  getRoleFeatures(roleName: string): Observable<any[]> {
    return this.getRoleFeaturesObservable(roleName);
  }

}
