/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CatalogoUcExtemporaneoComponent } from './catalogo-uc-extemporaneo.component';

describe('CatalogoUcExtemporaneoComponent', () => {
  let component: CatalogoUcExtemporaneoComponent;
  let fixture: ComponentFixture<CatalogoUcExtemporaneoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogoUcExtemporaneoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogoUcExtemporaneoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
