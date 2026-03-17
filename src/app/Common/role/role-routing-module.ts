import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleList } from './role-list/role-list';
import { EditRole } from './edit-role/edit-role';

const routes: Routes = [
  {
    path: '',
    component:RoleList
  },
  {
    path: 'edit',
    component: EditRole
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleRoutingModule { }
