import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegionRoutingModule } from './region-routing-module';
import { RegionList } from './region-list/region-list';
import { EditRegion } from './edit-region/edit-region';


@NgModule({
  declarations: [
    RegionList,
    EditRegion
  ],
  imports: [
    CommonModule,
    RegionRoutingModule
  ]
})
export class RegionModule { }
