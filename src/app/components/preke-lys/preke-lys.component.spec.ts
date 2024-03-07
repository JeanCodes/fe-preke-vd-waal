import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrekeLysComponent } from './preke-lys.component';

describe('PrekeLysComponent', () => {
  let component: PrekeLysComponent;
  let fixture: ComponentFixture<PrekeLysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrekeLysComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PrekeLysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
