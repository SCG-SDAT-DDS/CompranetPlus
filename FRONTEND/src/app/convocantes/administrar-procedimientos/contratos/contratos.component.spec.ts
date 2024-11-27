import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratosComponent } from './contratos.component';

describe('ContratosComponent', () => {
  let component: ContratosComponent;
  let fixture: ComponentFixture<ContratosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContratosComponent]
    });
    fixture = TestBed.createComponent(ContratosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
