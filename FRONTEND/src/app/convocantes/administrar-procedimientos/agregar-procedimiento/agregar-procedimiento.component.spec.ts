import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarProcedimientoComponent } from './agregar-procedimiento.component';

describe('AgregarProcedimientoComponent', () => {
  let component: AgregarProcedimientoComponent;
  let fixture: ComponentFixture<AgregarProcedimientoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgregarProcedimientoComponent]
    });
    fixture = TestBed.createComponent(AgregarProcedimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
