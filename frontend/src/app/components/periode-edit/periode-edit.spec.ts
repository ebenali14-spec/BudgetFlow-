import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodeEdit } from './periode-edit';

describe('PeriodeEdit', () => {
  let component: PeriodeEdit;
  let fixture: ComponentFixture<PeriodeEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodeEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodeEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
