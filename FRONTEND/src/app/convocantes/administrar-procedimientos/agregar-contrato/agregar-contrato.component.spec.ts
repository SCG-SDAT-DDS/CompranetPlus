import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarContratoComponent } from './agregar-contrato.component';

describe('AgregarContratoComponent', () => {
  let component: AgregarContratoComponent;
  let fixture: ComponentFixture<AgregarContratoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgregarContratoComponent]
    });
    fixture = TestBed.createComponent(AgregarContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
