import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacesComponent } from './faces.component';

describe('FacesComponent', () => {
  let component: FacesComponent;
  let fixture: ComponentFixture<FacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
