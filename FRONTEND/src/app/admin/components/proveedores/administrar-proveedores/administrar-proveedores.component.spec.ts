import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrarProveedoresComponent } from './administrar-proveedores.component';

describe('AdministrarProveedoresComponent', () => {
  let component: AdministrarProveedoresComponent;
  let fixture: ComponentFixture<AdministrarProveedoresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdministrarProveedoresComponent]
    });
    fixture = TestBed.createComponent(AdministrarProveedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
