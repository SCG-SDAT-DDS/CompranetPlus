/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CatalogoUrSupervisoresComponent } from './catalogo-ur-supervisores.component';

describe('CatalogoUrSupervisoresComponent', () => {
  let component: CatalogoUrSupervisoresComponent;
  let fixture: ComponentFixture<CatalogoUrSupervisoresComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogoUrSupervisoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogoUrSupervisoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
