import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionPuntos } from './gestion-puntos';

describe('GestionPuntos', () => {
  let component: GestionPuntos;
  let fixture: ComponentFixture<GestionPuntos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionPuntos],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionPuntos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
