import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreguntasProcedimientoComponent } from './preguntas-procedimiento.component';

describe('PartidasPresupuestalesComponent', () => {
  let component: PreguntasProcedimientoComponent;
  let fixture: ComponentFixture<PreguntasProcedimientoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreguntasProcedimientoComponent]
    });
    fixture = TestBed.createComponent(PreguntasProcedimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
