import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnunciosTableroComponent } from './anuncios-tablero.component';

describe('AnunciosTableroComponent', () => {
  let component: AnunciosTableroComponent;
  let fixture: ComponentFixture<AnunciosTableroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnunciosTableroComponent]
    });
    fixture = TestBed.createComponent(AnunciosTableroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
