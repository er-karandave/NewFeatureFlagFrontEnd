import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRegion } from './edit-region';

describe('EditRegion', () => {
  let component: EditRegion;
  let fixture: ComponentFixture<EditRegion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditRegion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditRegion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
