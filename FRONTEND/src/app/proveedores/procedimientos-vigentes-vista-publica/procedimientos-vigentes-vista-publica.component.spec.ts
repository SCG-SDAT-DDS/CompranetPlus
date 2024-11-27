/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProcedimientosVigentesVistaPublicaComponent } from './procedimientos-vigentes-vista-publica.component';

describe('ProcedimientosVigentesVistaPublicaComponent', () => {
  let component: ProcedimientosVigentesVistaPublicaComponent;
  let fixture: ComponentFixture<ProcedimientosVigentesVistaPublicaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcedimientosVigentesVistaPublicaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedimientosVigentesVistaPublicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
