import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCommonModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import { ExampleDialogComponent } from './preke-lys-detail.component';
import { HoofstukkeDialogComponent } from './hoofstukke-dialog/hoofstukke-dialog.component';

@NgModule({
  declarations: [ExampleDialogComponent, HoofstukkeDialogComponent],
  entryComponents: [ExampleDialogComponent],
  imports: [
    FormsModule,
    MatButtonModule,
    MatCommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
  ],
})
export class ExampleDialogModule {}
