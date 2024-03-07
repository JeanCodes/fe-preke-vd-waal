import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'preke-lys-detail',
  templateUrl: 'preke-lys-detail.component.html',
  styleUrls: ['./preke-lys-detail.component.css'],
})
export class ExampleDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ExampleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public enkelePreek: any,
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }
}
