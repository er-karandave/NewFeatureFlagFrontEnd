import { Component, computed, inject, signal } from '@angular/core';
import { UserService } from '../../../Services/user-service';
import { Router } from '@angular/router';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roleName?: string; 
  regionName?: string;
  userRole: string;  
  dob?: string;
  region: string;
}

export interface UserApiResponse {
  data: User[];
  totalCount: number;
  success: boolean;
  message?: string;
}

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList {

  userService = inject(UserService);
  private router = inject(Router);
  searchQuery = signal('');
  users = this.userService.users;
  loading = this.userService.loading;
  error = this.userService.error;
  totalUsers = computed(() => {
    return this.users().length;
  });

  displayUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const usersList = this.users();

    if (!query) {
      return usersList;
    }

    return usersList.filter(user => {
      const firstNameMatch = user.firstName.toLowerCase().includes(query);
      const lastNameMatch = user.lastName.toLowerCase().includes(query);
      const emailMatch = user.email.toLowerCase().includes(query);
      const roleMatch = user.userRole.toLowerCase().includes(query);
      const regionMatch = user.region.toLowerCase().includes(query);
      return firstNameMatch || lastNameMatch || emailMatch || roleMatch || regionMatch;
    });
  });
  assignedUsersCount = computed(() => {
    const usersList = this.users();
    return usersList.filter(user => user.roleName && user.roleName.trim() !== '').length;
  });

  displayUsersCount = computed(() => {
    return this.displayUsers().length;
  });

  hasError = computed(() => {
    return this.error() !== null;
  });

  isLoading = computed(() => {
    return this.loading() === true;
  });

  ngOnInit(): void {
    this.userService.loadUsers();
  }

  onSearchChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
  }

  editUser(userId: number): void {
    this.router.navigate(['/users/edit-user', userId]);
  }

  refresh(): void {
    this.userService.loadUsers();
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }

}
