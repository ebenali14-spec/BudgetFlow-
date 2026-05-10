import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodeCreate } from './periode-create';

describe('PeriodeCreate', () => {
  let component: PeriodeCreate;
  let fixture: ComponentFixture<PeriodeCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodeCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodeCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
