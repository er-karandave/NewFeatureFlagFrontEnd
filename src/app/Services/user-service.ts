import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { User, UserApiResponse } from '../Common/users/user-list/user-list';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7237/api';

  private usersSignal = signal<User[]>([]);
  currentUserSignal = signal<User | null>(null);
  private loadingSignal = signal<boolean>(false);
  errorSignal = signal<string | null>(null);
  private savingSignal = signal<boolean>(false);
  private userRolesSignal = signal<string[]>([]);
  private regionsSignal = signal<string[]>([]);
  private dropdownLoadingSignal = signal<boolean>(false);

  users = computed(() => this.usersSignal());
  currentUser = computed(() => this.currentUserSignal());
  loading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());
  saving = computed(() => this.savingSignal());
  userRoles = computed(() => this.userRolesSignal());
  regions = computed(() => this.regionsSignal());
  dropdownLoading = computed(() => this.dropdownLoadingSignal());

  // loadUsers(): void {
  //   this.loadingSignal.set(true);
  //   this.errorSignal.set(null);

  //   this.http.get<UserApiResponse>(this.apiUrl + '/user').pipe(
  //     catchError((error: HttpErrorResponse) => {
  //       this.errorSignal.set(error.message || 'Failed to load users');
  //       this.loadingSignal.set(false);
  //       return throwError(() => error);
  //     })
  //   ).subscribe({
  //     next: (response) => {
  //       if (response.success) {
  //         this.usersSignal.set(response.data);
  //       } else {
  //         this.errorSignal.set(response.message || 'Failed to load users');
  //       }
  //       this.loadingSignal.set(false);
  //     },
  //     error: () => {
  //       this.loadingSignal.set(false);
  //     }
  //   });
  // }

  loadUsers(): void {
    this.loadUsersObservable().subscribe();
  }

  loadUsersObservable(): Observable<User[]> {
    this.loadingSignal.set(true);
    return this.http.get<any>(this.apiUrl + '/user').pipe(
      tap((response) => {
        if (response.success) {
          this.usersSignal.set(response.data);
        }
        this.loadingSignal.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorSignal.set(error.message || 'Failed to load users');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  getUserById(id: number): Observable<User> {
    this.loadingSignal.set(true);

    return this.http.get<User>(`${this.apiUrl}/user/${id}`).pipe(
      tap((user) => {
        this.currentUserSignal.set(user);
        this.loadingSignal.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorSignal.set(error.message || 'Failed to load user');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/user/${user.id}`, user).pipe(
      catchError((error: HttpErrorResponse) => {
        this.errorSignal.set(error.message || 'Failed to update user');
        this.savingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  assignUserToRole(userId: number, roleName: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/user/${userId}/role`, { userRole: roleName });
  }

  removeUserFromRole(userId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/user/${userId}/role`, { userRole: '' });
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  setSaving(value: boolean): void {
    this.savingSignal.set(value);
  }

  // loadUserRoles(): void {
  //   this.dropdownLoadingSignal.set(true);
  //   this.http.get<string[]>(`${this.apiUrl}/user/roles`).subscribe({
  //     next: (roles) => {
  //       this.userRolesSignal.set(roles);
  //       this.dropdownLoadingSignal.set(false);
  //     },
  //     error: () => {
  //       this.dropdownLoadingSignal.set(false);
  //     }
  //   });
  // }

  // loadRegions(): void {
  //   this.dropdownLoadingSignal.set(true);
  //   this.http.get<string[]>(`${this.apiUrl}/user/regions`).subscribe({
  //     next: (regions) => {
  //       this.regionsSignal.set(regions);
  //       this.dropdownLoadingSignal.set(false);
  //     },
  //     error: () => {
  //       this.dropdownLoadingSignal.set(false);
  //     }
  //   });
  // }

  loadUserRolesObservable(): Observable<string[]> {
    this.dropdownLoadingSignal.set(true);
    return this.http.get<string[]>(`${this.apiUrl}/user/roles`).pipe(
      tap((roles) => {
        this.userRolesSignal.set(roles);
        this.dropdownLoadingSignal.set(false);
      }),
      catchError((error) => {
        this.dropdownLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  loadRegionsObservable(): Observable<string[]> {
    this.dropdownLoadingSignal.set(true);
    return this.http.get<string[]>(`${this.apiUrl}/user/regions`).pipe(
      tap((regions) => {
        this.regionsSignal.set(regions);
        this.dropdownLoadingSignal.set(false);
      }),
      catchError((error) => {
        this.dropdownLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  loadUserRoles(): void {
    this.loadUserRolesObservable().subscribe();
  }

  loadRegions(): void {
    this.loadRegionsObservable().subscribe();
  }
}
