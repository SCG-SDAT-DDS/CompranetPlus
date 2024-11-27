/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CatalogoUnidadResponsableComponent } from './catalogo-unidad-responsable.component';

describe('CatalogoUnidadResponsableComponent', () => {
  let component: CatalogoUnidadResponsableComponent;
  let fixture: ComponentFixture<CatalogoUnidadResponsableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogoUnidadResponsableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogoUnidadResponsableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
