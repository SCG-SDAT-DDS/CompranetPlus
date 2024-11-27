import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaReportesComponent } from './lista-reportes.component';

describe('ListaReportesComponent', () => {
  let component: ListaReportesComponent;
  let fixture: ComponentFixture<ListaReportesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListaReportesComponent]
    });
    fixture = TestBed.createComponent(ListaReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
