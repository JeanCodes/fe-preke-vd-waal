import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-hoofstukke-dialog',
  templateUrl: './hoofstukke-dialog.component.html',
  styleUrls: ['./hoofstukke-dialog.component.css'],
})
export class HoofstukkeDialogComponent implements OnInit {
  public checkedStates: { boek: string; chapter: number; checked: boolean }[] =
    [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<HoofstukkeDialogComponent>,
  ) {
    console.log('this.data: ', this.data);
    this.data.checkedChaptersState = this.data.checkedChaptersState.filter(
      (item: any) => item.boek === this.data.boek,
    );
    if (
      this.data.checkedChaptersState &&
      this.data.checkedChaptersState.length > 0
    ) {
      this.checkedStates = this.data.checkedChaptersState;
    } else {
      this.checkedStates = this.data.relevantChapters.map((chapter: any) => ({
        boek: this.data.boek,
        boekno: this.data.boekno,
        chapter,
        checked: false,
      }));
    }
  }

  ngOnInit() {
    this.dialogRef.beforeClosed().subscribe(() => this.logSelectedItems());
  }

  checkAllHoofstukke(): void {
    for (let state of this.checkedStates) {
      state.checked = true;
    }
  }

  uncheckAllHoofstukke(): void {
    for (let state of this.checkedStates) {
      state.checked = false;
    }
  }

  logSelectedItems() {
    const selectedItems = this.checkedStates
      .filter((item) => item.checked)
      .map((item) => item.chapter);
    const returnData = {
        data: this.data,
        selectedChapters: selectedItems,
        checkedStates: this.checkedStates,
    };
    console.log('About to return: ',returnData);
    this.dialogRef.close(returnData);
  }
}
