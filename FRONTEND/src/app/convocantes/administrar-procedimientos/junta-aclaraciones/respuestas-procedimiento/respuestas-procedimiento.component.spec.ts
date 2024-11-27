import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespuestasProcedimientoComponent } from './respuestas-procedimiento.component';

describe('PartidasPresupuestalesComponent', () => {
  let component: RespuestasProcedimientoComponent;
  let fixture: ComponentFixture<RespuestasProcedimientoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RespuestasProcedimientoComponent]
    });
    fixture = TestBed.createComponent(RespuestasProcedimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
