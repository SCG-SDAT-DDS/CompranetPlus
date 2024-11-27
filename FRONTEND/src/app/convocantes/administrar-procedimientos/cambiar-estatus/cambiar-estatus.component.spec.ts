import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiarEstatusComponent } from './cambiar-estatus.component';

describe('CambiarEstatusComponent', () => {
  let component: CambiarEstatusComponent;
  let fixture: ComponentFixture<CambiarEstatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CambiarEstatusComponent]
    });
    fixture = TestBed.createComponent(CambiarEstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
