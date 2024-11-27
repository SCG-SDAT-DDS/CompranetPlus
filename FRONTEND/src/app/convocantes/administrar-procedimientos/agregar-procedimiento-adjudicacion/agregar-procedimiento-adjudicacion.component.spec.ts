import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarProcedimientoAdjudicacionComponent } from './agregar-procedimiento-adjudicacion.component';

describe('AgregarProcedimientoAdjudicacionComponent', () => {
  let component: AgregarProcedimientoAdjudicacionComponent;
  let fixture: ComponentFixture<AgregarProcedimientoAdjudicacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgregarProcedimientoAdjudicacionComponent]
    });
    fixture = TestBed.createComponent(AgregarProcedimientoAdjudicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
