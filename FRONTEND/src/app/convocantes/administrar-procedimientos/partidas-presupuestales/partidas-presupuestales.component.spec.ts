import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartidasPresupuestalesComponent } from './partidas-presupuestales.component';

describe('PartidasPresupuestalesComponent', () => {
  let component: PartidasPresupuestalesComponent;
  let fixture: ComponentFixture<PartidasPresupuestalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartidasPresupuestalesComponent]
    });
    fixture = TestBed.createComponent(PartidasPresupuestalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
