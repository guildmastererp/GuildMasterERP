import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Roster } from './roster';

describe('Roster', () => {
  let component: Roster;
  let fixture: ComponentFixture<Roster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Roster],
    }).compileComponents();

    fixture = TestBed.createComponent(Roster);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
