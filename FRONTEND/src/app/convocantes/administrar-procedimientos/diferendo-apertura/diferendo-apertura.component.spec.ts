import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiferendoAperturaComponent } from './diferendo-apertura.component';

describe('DiferendoAperturaComponent', () => {
  let component: DiferendoAperturaComponent;
  let fixture: ComponentFixture<DiferendoAperturaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiferendoAperturaComponent]
    });
    fixture = TestBed.createComponent(DiferendoAperturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
