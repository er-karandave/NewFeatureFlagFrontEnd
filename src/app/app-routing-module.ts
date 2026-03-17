import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './Common/dashboard/dashboard';

const routes: Routes = [
  {
    path:'',
    component: Dashboard
  },
  {
    path: 'roles',
    loadChildren: () => import('../app/Common/role/role-module').then(m => m.RoleModule)
  },
  {
    path: 'features',
    loadChildren: () => import('../app/Common/features/features-module').then(m => m.FeaturesModule)
  },
  {
    path: 'users',
    loadChildren: () => import('../app/Common/users/users-module').then(m => m.UsersModule)
  },
  {
    path: 'regions',
    loadChildren: () => import('../app/Common/region/region-module').then(m => m.RegionModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
