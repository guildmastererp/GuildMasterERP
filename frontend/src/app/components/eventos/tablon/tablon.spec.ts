import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tablon } from './tablon';

describe('Tablon', () => {
  let component: Tablon;
  let fixture: ComponentFixture<Tablon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Tablon],
    }).compileComponents();

    fixture = TestBed.createComponent(Tablon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
