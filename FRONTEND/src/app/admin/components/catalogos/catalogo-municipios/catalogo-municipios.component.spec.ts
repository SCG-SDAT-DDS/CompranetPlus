/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CatalogoMunicipiosComponent } from './catalogo-municipios.component';

describe('CatalogoMunicipiosComponent', () => {
  let component: CatalogoMunicipiosComponent;
  let fixture: ComponentFixture<CatalogoMunicipiosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogoMunicipiosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogoMunicipiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
