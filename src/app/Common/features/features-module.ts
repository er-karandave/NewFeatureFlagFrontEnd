import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeaturesRoutingModule } from './features-routing-module';
import { FeatureList } from './feature-list/feature-list';
import { EditFeature } from './edit-feature/edit-feature';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    FeatureList,
    EditFeature
  ],
  imports: [
    CommonModule,
    FeaturesRoutingModule,FormsModule
  ]
})
export class FeaturesModule { }
