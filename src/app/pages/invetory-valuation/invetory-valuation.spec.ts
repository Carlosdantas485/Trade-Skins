import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvetoryValuation } from './invetory-valuation';

describe('InvetoryValuation', () => {
  let component: InvetoryValuation;
  let fixture: ComponentFixture<InvetoryValuation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvetoryValuation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvetoryValuation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
