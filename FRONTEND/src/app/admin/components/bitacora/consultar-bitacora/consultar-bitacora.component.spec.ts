import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarBitacoraComponent } from './consultar-bitacora.component';

describe('ConsultarBitacoraComponent', () => {
  let component: ConsultarBitacoraComponent;
  let fixture: ComponentFixture<ConsultarBitacoraComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultarBitacoraComponent]
    });
    fixture = TestBed.createComponent(ConsultarBitacoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
