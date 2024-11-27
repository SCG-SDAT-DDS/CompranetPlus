import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnexosProcedimientosComponent } from './anexos-procedimientos.component';

describe('AnexosProcedimientosComponent', () => {
  let component: AnexosProcedimientosComponent;
  let fixture: ComponentFixture<AnexosProcedimientosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnexosProcedimientosComponent]
    });
    fixture = TestBed.createComponent(AnexosProcedimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
