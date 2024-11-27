import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncabezadoProcedimientoComponent } from './encabezado-procedimiento.component';

describe('EncabezadoProcedimientoComponent', () => {
  let component: EncabezadoProcedimientoComponent;
  let fixture: ComponentFixture<EncabezadoProcedimientoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EncabezadoProcedimientoComponent]
    });
    fixture = TestBed.createComponent(EncabezadoProcedimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
