import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Outlet } from './outlet';

describe('Outlet', () => {
  let component: Outlet;
  let fixture: ComponentFixture<Outlet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Outlet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Outlet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
