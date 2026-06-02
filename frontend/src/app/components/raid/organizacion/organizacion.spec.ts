import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Organizacion } from './organizacion';

describe('Organizacion', () => {
  let component: Organizacion;
  let fixture: ComponentFixture<Organizacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Organizacion],
    }).compileComponents();

    fixture = TestBed.createComponent(Organizacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
