import { Component, computed, inject, signal } from '@angular/core';
import { RoleService } from '../../../Services/role-service';
import { Router } from '@angular/router';

export interface Role {
  roleName: string;
  description?: string;
  assignedUsersCount: number;
  createdDate?: string;
  isActive: boolean;
  grantedFeaturesCount?: number;
}

export interface RoleApiResponse {
  data: Role[];
  totalCount: number;
  success: boolean;
  message?: string;
}

@Component({
  selector: 'app-role-list',
  standalone: false,
  templateUrl: './role-list.html',
  styleUrl: './role-list.css',
})
export class RoleList {

  roleService = inject(RoleService);
  private router = inject(Router);
  searchQuery = signal('');
  roles = this.roleService.roles;
  loading = this.roleService.loading;
  error = this.roleService.error;
  totalRoles = computed(() => {
    return this.roles().length;
  });

  totalAssignments = computed(() => {
    const rolesList = this.roles();
    console.log('Calculating total assignments from roles:', rolesList);
    return rolesList.reduce((sum, role) => sum + role.assignedUsersCount, 0);
  });

  totalGrantedFeatures = computed(() => {
    const rolesList = this.roles();
    console.log('Calculating total granted features from roles:', rolesList);
    return rolesList.reduce((sum, role) => sum + (role.grantedFeaturesCount || 0), 0);
  });

  displayRoles = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const rolesList = this.roles();
    if (!query) {
      return rolesList;
    }
    return rolesList.filter(role => {
      const nameMatch = role.roleName.toLowerCase().includes(query);
      const descMatch = role.description?.toLowerCase().includes(query) || false;
      return nameMatch || descMatch;
    });
  });

  displayRolesCount = computed(() => {
    return this.displayRoles().length;
  });

  hasError = computed(() => {
    return this.error() !== null;
  });

  isLoading = computed(() => {
    return this.loading() === true;
  });

  ngOnInit(): void {
    this.roleService.loadRoles();
  }

  onSearchChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
  }

  editRole(roleName: string): void {
    this.router.navigate(['/roles/edit'], {
      queryParams: { role: roleName }
    });
  }

  refresh(): void {
    this.roleService.loadRoles();
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  trackByRoleId(index: number, role: Role): string {
    return role.roleName;
  }

}
