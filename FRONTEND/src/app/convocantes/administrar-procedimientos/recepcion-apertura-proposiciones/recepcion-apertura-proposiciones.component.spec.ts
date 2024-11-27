/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RecepcionAperturaProposicionesComponent } from './recepcion-apertura-proposiciones.component';

describe('RecepcionAperturaProposicionesComponent', () => {
  let component: RecepcionAperturaProposicionesComponent;
  let fixture: ComponentFixture<RecepcionAperturaProposicionesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecepcionAperturaProposicionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepcionAperturaProposicionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
