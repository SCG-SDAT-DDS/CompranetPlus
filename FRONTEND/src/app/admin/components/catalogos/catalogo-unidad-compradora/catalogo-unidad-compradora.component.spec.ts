/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CatalogoUnidadCompradoraComponent } from './catalogo-unidad-compradora.component';

describe('CatalogoUnidadCompradoraComponent', () => {
  let component: CatalogoUnidadCompradoraComponent;
  let fixture: ComponentFixture<CatalogoUnidadCompradoraComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogoUnidadCompradoraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogoUnidadCompradoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
