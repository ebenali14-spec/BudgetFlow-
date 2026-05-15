import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorieDetail } from './categorie-detail';

describe('CategorieDetail', () => {
  let component: CategorieDetail;
  let fixture: ComponentFixture<CategorieDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorieDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategorieDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
