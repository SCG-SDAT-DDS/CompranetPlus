import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrarAdjudicacionComponent } from './administrar-adjudicacion.component';

describe('AdministrarAdjudicacionComponent', () => {
  let component: AdministrarAdjudicacionComponent;
  let fixture: ComponentFixture<AdministrarAdjudicacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdministrarAdjudicacionComponent]
    });
    fixture = TestBed.createComponent(AdministrarAdjudicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
