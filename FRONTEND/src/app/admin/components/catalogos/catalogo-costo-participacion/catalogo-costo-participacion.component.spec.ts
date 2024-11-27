/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CatalogoCostoParticipacionComponent } from './catalogo-costo-participacion.component';

describe('CatalogoCostoParticipacionComponent', () => {
  let component: CatalogoCostoParticipacionComponent;
  let fixture: ComponentFixture<CatalogoCostoParticipacionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogoCostoParticipacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogoCostoParticipacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
