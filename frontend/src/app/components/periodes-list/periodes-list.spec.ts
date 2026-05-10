import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodesList } from './periodes-list';

describe('PeriodesList', () => {
  let component: PeriodesList;
  let fixture: ComponentFixture<PeriodesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodesList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
