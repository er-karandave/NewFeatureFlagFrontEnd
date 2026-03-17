import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeatureList } from './feature-list/feature-list';
import { EditFeature } from './edit-feature/edit-feature';

const routes: Routes = [
  {
    path:'',
    component:FeatureList
  },
  {
    path:'edit-feature/:id',
    component:EditFeature
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeaturesRoutingModule { }
