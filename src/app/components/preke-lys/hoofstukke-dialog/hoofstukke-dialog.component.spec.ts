import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoofstukkeDialogComponent } from './hoofstukke-dialog.component';

describe('HoofstukkeDialogComponent', () => {
  let component: HoofstukkeDialogComponent;
  let fixture: ComponentFixture<HoofstukkeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoofstukkeDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoofstukkeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
