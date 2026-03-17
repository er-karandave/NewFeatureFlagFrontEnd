import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegionList } from './region-list/region-list';
import { EditRegion } from './edit-region/edit-region';

const routes: Routes = [
  {
    path: '',
    component: RegionList,
  },
  {
    path:'edit-region',
    component:EditRegion
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegionRoutingModule { }
