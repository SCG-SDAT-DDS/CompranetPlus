import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionPropuestaFalloComponent } from './evaluacion-propuesta-fallo.component';

describe('EvaluacionPropuestaFalloComponent', () => {
  let component: EvaluacionPropuestaFalloComponent;
  let fixture: ComponentFixture<EvaluacionPropuestaFalloComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EvaluacionPropuestaFalloComponent]
    });
    fixture = TestBed.createComponent(EvaluacionPropuestaFalloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
