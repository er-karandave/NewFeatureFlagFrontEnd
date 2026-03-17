import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureList } from './feature-list';

describe('FeatureList', () => {
  let component: FeatureList;
  let fixture: ComponentFixture<FeatureList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeatureList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
