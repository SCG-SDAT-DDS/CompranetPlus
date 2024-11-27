/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CatalogoDiasFestivosComponent } from './catalogo-dias-festivos.component';

describe('CatalogoDiasFestivosComponent', () => {
  let component: CatalogoDiasFestivosComponent;
  let fixture: ComponentFixture<CatalogoDiasFestivosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogoDiasFestivosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogoDiasFestivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
