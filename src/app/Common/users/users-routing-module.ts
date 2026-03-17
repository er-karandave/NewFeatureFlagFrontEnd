import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserList } from './user-list/user-list';
import { EditUser } from './edit-user/edit-user';

const routes: Routes = [
  {
    path: '',
    component:UserList,
  },
  {
    path:'edit-user/:id',
    component:EditUser
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
