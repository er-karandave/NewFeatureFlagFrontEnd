import { computed, inject, Injectable, signal } from '@angular/core';
import { Region, RegionApiResponse } from '../Common/region/region-list/region-list';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegionService {

  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7237/api/region';

  private regionsSignal = signal<Region[]>([]);
  private currentRegionSignal = signal<Region | null>(null);
  private loadingSignal = signal<boolean>(false);
  errorSignal = signal<string | null>(null);
  private savingSignal = signal<boolean>(false);

  regions = computed(() => this.regionsSignal());
  currentRegion = computed(() => this.currentRegionSignal());
  loading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());
  saving = computed(() => this.savingSignal());

  loadRegions(): void {
    this.loadingSignal.set(true);
    this.http.get<RegionApiResponse>(this.apiUrl).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Loaded regions:', response.data);
          this.regionsSignal.set(response.data);
        } else {
          this.errorSignal.set(response.message || 'Failed to load regions');
        }
        this.loadingSignal.set(false);
      },
      error: () => {
        this.loadingSignal.set(false);
      }
    });
  }

  getRegionByName(regionName: string): void {
    this.loadingSignal.set(true);
    this.http.get<Region>(`${this.apiUrl}/${encodeURIComponent(regionName)}`).subscribe({
      next: (region) => {
        this.currentRegionSignal.set(region);
        this.loadingSignal.set(false);
      },
      error: () => {
        this.loadingSignal.set(false);
      }
    });
  }

  // getRegionByNameObservable(regionName: string): Observable<Region> {
  //   this.loadingSignal.set(true);
  //   return this.http.get<Region>(`${this.apiUrl}/${encodeURIComponent(regionName)}`).pipe(
  //     tap((region) => {
  //       this.currentRegionSignal.set(region);
  //       this.loadingSignal.set(false);
  //     }),
  //     catchError((error: HttpErrorResponse) => {
  //       this.errorSignal.set(error.message || 'Failed to load region');
  //       this.loadingSignal.set(false);
  //       return throwError(() => error);
  //     })
  //   );
  // }

  getRegionByNameObservable(regionName: string): Observable<Region> {
    this.loadingSignal.set(true);
    return this.http.get<Region>(`${this.apiUrl}/${encodeURIComponent(regionName)}`).pipe(
      tap((region) => {
        this.currentRegionSignal.set(region);
        this.loadingSignal.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorSignal.set(error.message || 'Failed to load region');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  renameRegion(oldRegionName: string, newRegionName: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/rename`, {
      oldRegionName,
      newRegionName
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        this.errorSignal.set(error.message || 'Failed to rename region');
        this.savingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  setSaving(value: boolean): void {
    this.savingSignal.set(value);
  }

}
