import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleLicitacionComponent } from './detalle-licitacion.component';

describe('DetalleLicitacionComponent', () => {
  let component: DetalleLicitacionComponent;
  let fixture: ComponentFixture<DetalleLicitacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetalleLicitacionComponent]
    });
    fixture = TestBed.createComponent(DetalleLicitacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
