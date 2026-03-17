import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

interface DashboardItem {
  title: string;
  icon: string;
  route: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  dashboardItems = signal<DashboardItem[]>([
    {
      title: 'Roles',
      icon: '👥',
      route: '/roles',
      color: '#4CAF50',
      description: 'Manage user roles'
    },
    {
      title: 'Users',
      icon: '👤',
      route: '/users',
      color: '#2196F3',
      description: 'Manage system users'
    },
    {
      title: 'Regions',
      icon: '🌍',
      route: '/regions',
      color: '#FF9800',
      description: 'Manage regions'
    },
    {
      title: 'Feature Permissions',
      icon: '🔐',
      route: '/features',
      color: '#9C27B0',
      description: 'Manage feature access'
    }
  ]);

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
