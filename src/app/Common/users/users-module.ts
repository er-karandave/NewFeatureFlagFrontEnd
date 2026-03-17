import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing-module';
import { UserList } from './user-list/user-list';
import { EditUser } from './edit-user/edit-user';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    UserList,
    EditUser
  ],
  imports: [
    CommonModule,
    UsersRoutingModule, FormsModule
  ]
})
export class UsersModule { }
