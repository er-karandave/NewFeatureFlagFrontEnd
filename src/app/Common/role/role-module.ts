import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoleRoutingModule } from './role-routing-module';
import { RoleList } from './role-list/role-list';
import { EditRole } from './edit-role/edit-role';


@NgModule({
  declarations: [
    RoleList,
    EditRole
  ],
  imports: [
    CommonModule,
    RoleRoutingModule
  ]
})
export class RoleModule { }
