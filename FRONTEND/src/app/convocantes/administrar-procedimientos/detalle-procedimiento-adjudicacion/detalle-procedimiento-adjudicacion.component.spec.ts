import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleProcedimientoAdjudicacionComponent } from './detalle-procedimiento-adjudicacion.component';

describe('DetalleProcedimientoAdjudicacionComponent', () => {
  let component: DetalleProcedimientoAdjudicacionComponent;
  let fixture: ComponentFixture<DetalleProcedimientoAdjudicacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetalleProcedimientoAdjudicacionComponent]
    });
    fixture = TestBed.createComponent(DetalleProcedimientoAdjudicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
