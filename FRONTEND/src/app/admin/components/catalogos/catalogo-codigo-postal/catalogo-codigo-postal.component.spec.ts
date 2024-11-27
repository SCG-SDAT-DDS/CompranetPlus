import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogoCodigoPostalComponent } from './catalogo-codigo-postal.component';

describe('CatalogoCodigoPostalComponent', () => {
  let component: CatalogoCodigoPostalComponent;
  let fixture: ComponentFixture<CatalogoCodigoPostalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CatalogoCodigoPostalComponent]
    });
    fixture = TestBed.createComponent(CatalogoCodigoPostalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
