import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { ExampleDialogComponent } from './preke-lys-detail.component';
import { HoofstukkeDialogComponent } from './hoofstukke-dialog/hoofstukke-dialog.component';

import { LanguageService } from '../../services/site_taal.service';
import { PrekeService } from 'src/app/services/preke.service';
import { FinaalPrekeService } from 'src/app/services/finaal_preke.service';
import { BybelBoekeService } from 'src/app/services/bybel-boeke.service';
import { BronneService } from 'src/app/services/bronne.service';
import { TeksteService } from 'src/app/services/tekste.service';

@Component({
  selector: 'app-preke-lys',
  templateUrl: './preke-lys.component.html',
  styleUrls: ['./preke-lys.component.css'],
})
export class PrekeLysComponent implements OnInit {
  boeke: any;
  preke: any;
  finaal_preke: any;
  bronne: any;
  tekste: any;
  mergedPreke: any = [];
  mergedBoeke: any = [];
  mergedBronne: any = [];
  preFilter: any = [];
  myFinalFilters: any = [];
  relevantChapters: any = [];
  outestament: any = [];
  nuwetestament: any = [];
  uniqueGroupedByBoek: any = {};
  romantiek: any = [];
  ouTestamentVerses: any = [];
  nuweTestamentVerses: any = [];
  tema = '';
  checkedChaptersState: { boek: string; chapter: number; checked: boolean }[] =
    [];
  myCheckedChapters: { boek: string; chapter: number; checked: boolean }[] = [];
  dataSource: any = '';
  prekeCount: number = 0;
  belydenisse: any;
  belydenisse_gekies: any;
  page: number = 1;
  count: number = 0;
  tableSize: number = 10;
  data: any;
  public currentLanguage: string = '';
  private langSubscription!: Subscription;
  filters = {
    tema: '',
    id: '',
    taal: 'Als',
    bron: 'Als',
    begin: '',
    eind: '',
    eenjaar: '',
    skandering: 'Als',
    teksopsie: 'Als',
  };

  public loading = true;

  constructor(
    private prekeService: PrekeService,
    private finaalPrekeService: FinaalPrekeService,
    private bybelBoekeService: BybelBoekeService,
    private bronneService: BronneService,
    private teksteService: TeksteService,
    private formBuilder: FormBuilder,
    private ReactiveFormsModule: ReactiveFormsModule,
    public dialog: MatDialog,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.langSubscription = this.languageService.currentLanguage.subscribe(
      (lang) => {
        this.currentLanguage = lang;
      },
    );
    this.retrievePreke();
  }
  isOldTestamentVisible = false;
  isNewTestamentVisible = false;
  isBelTestamentVisible = false;

  toggleBelTestamentVisibility() {
    this.isBelTestamentVisible = !this.isBelTestamentVisible;
  }
  toggleNewTestamentVisibility() {
    this.isNewTestamentVisible = !this.isNewTestamentVisible;
  }
  toggleOldTestamentVisibility() {
    this.isOldTestamentVisible = !this.isOldTestamentVisible;
  }

  filterPreke() {
    this.myFinalFilters = [];

    // Apply 1 Jaar Filter
    if (this.filters.eenjaar && this.filters.eenjaar.length > 0) {
      const filteredData = this.mergedBronne.filter(
        (item: any) => Number(item.Jaar) === Number(this.filters.eenjaar),
      );
      this.myFinalFilters.push(...filteredData);
    }
    // Apply Begin & Eind Jaar Filter
    if (
      this.filters.begin &&
      this.filters.begin.length > 0 &&
      this.filters.eind &&
      this.filters.eind.length > 0
    ) {
      const begin = Number(this.filters.begin);
      const eind = Number(this.filters.eind);

      const filteredData = this.mergedBronne.filter((item: any) => {
        const jaar = Number(item.Jaar);
        return jaar >= begin && jaar <= eind;
      });
      this.myFinalFilters.push(...filteredData);
    } else if (this.filters.begin && this.filters.begin.length > 0) {
      const begin = Number(this.filters.begin);
      const filteredDataBegin = this.mergedBronne.filter(
        (item: any) => Number(item.Jaar) >= begin,
      );
      this.myFinalFilters.push(...filteredDataBegin);
    } else if (this.filters.eind && this.filters.eind.length > 0) {
      const eind = Number(this.filters.eind);
      const filteredDataEind = this.mergedBronne.filter(
        (item: any) => Number(item.Jaar) <= eind,
      );
      this.myFinalFilters.push(...filteredDataEind);
    }
    // Adding Preek whose number was filled in
    if (this.filters.id && this.filters.id.length > 0) {
      const filteredData = this.mergedBronne.filter(
        (item: any) => Number(item.PreekNo) === Number(this.filters.id),
      );
      this.myFinalFilters.push(...filteredData);
    }

    //Filtering mergedBronne to only include teksopsies selected
    if (this.filters.teksopsie != 'Als' && this.filters.teksopsie != 'Almal') {
      const filteredDataTeksOpsie = this.myFinalFilters.filter(
        (item: any) => item.P_L_B === this.filters.teksopsie,
      );
      this.myFinalFilters = filteredDataTeksOpsie;
    }
    //Filtering mergedBronne to only include taal selected
    if (this.filters.taal != 'Als' && this.filters.taal != 'Almal') {
      const filteredDataTaal = this.myFinalFilters.filter(
        (item: any) => item.Taal === this.filters.taal,
      );
      this.myFinalFilters = filteredDataTaal;
    }
    //Filtering mergedBronne to only include bron selected
    if (this.filters.bron != 'Als' && this.filters.bron != 'Almal') {
      const filteredDataBron = this.myFinalFilters.filter(
        (item: any) => item.Bron === this.filters.bron,
      );
      this.myFinalFilters = filteredDataBron;
    }

    interface MyFinalFilterItem {
      id: number;
      P_L_B: string;
      [key: string]: any; // Use specific types instead of any for a stricter type definition.
    }

    this.myFinalFilters = this.myFinalFilters.map((item: MyFinalFilterItem) => {
      // Amend KortBeskrywing if '0' property exists.
      if (item['0']) {
        return {
          ...item,
          KortBeskrywing: item['0'].KortBeskrywing,
        };
      } else {
        return item;
      }
    });

    // Filter to show only items with P_L_B === 'P'.
    this.myFinalFilters = this.myFinalFilters.filter(
      (itmInner: MyFinalFilterItem) => itmInner.P_L_B === 'P',
    );

    // Remove duplicates based on the 'id' property.
    const unique = new Map<number, MyFinalFilterItem>();
    this.myFinalFilters.forEach((item: MyFinalFilterItem) => {
      unique.set(item.id, item);
    });
    this.myFinalFilters = Array.from(unique.values());

    //Sorting myFinalFilters by PreekNo
    this.myFinalFilters.sort((a: any, b: any) => a.PreekNo - b.PreekNo);
    this.prekeCount = this.myFinalFilters.length;

    this.loading = false;
  }

  resetPage() {
    this.page = 1;
  }

  mergePreke() {
    this.loading = true;
    this.mergedBronne = [];
    this.mergedPreke = [];
    this.mergedBoeke = [];
    this.preke = this.finaal_preke;

    this.preke.forEach((prekeItem: any) => {
      const matches = this.tekste.filter(
        (itmInner: any) => itmInner.PreekNo === prekeItem.PreekNo,
      );

      matches.forEach((match: any) => {
        this.mergedPreke.push({
          ...prekeItem,
          ...match,
        });
      });
    });

    this.mergedPreke.forEach((mergedPrekeItem: any) => {
      const match = this.boeke.filter(
        (itmInner: any) => itmInner.BoekNo === mergedPrekeItem.BoekNo,
      );

      if (match) {
        this.mergedBoeke.push({
          ...mergedPrekeItem,
          ...match,
        });
      } else {
        this.mergedBoeke.push(mergedPrekeItem);
      }
    });

    this.mergedBoeke.forEach((mergedBoekeItem: any) => {
      const match = this.bronne.filter(
        (itmInner: any) => itmInner.BronNo === mergedBoekeItem.Bron,
      );
      if (match) {
        this.mergedBronne.push({
          ...mergedBoekeItem,
          ...match,
        });
      } else {
        this.mergedBronne.push(mergedBoekeItem);
      }
    });

    this.checkedChaptersState = this.mergedBronne.map((item: any) => ({
      boek: item.Boek,
      chapter: parseInt(item.Hoofstuk, 10), // Convert the Hoofstuk string to a number
      checked: false,
    }));
    this.filterPreke();
  }

  retrieveTekste(): void {
    this.teksteService.getAll().subscribe(
      (data) => {
        this.tekste = data;
        this.mergePreke();
      },
      (error) => {
        console.log(error);
      },
    );
  }

  retrieveBronne(): void {
    this.bronneService.getAll().subscribe(
      (data) => {
        this.bronne = data;
        this.retrieveTekste();
      },
      (error) => {
        console.log(error);
      },
    );
  }

  retrieveBoeke(): void {
    this.bybelBoekeService.getAll().subscribe(
      (data) => {
        this.boeke = data;
        this.romantiek = this.boeke.filter((a: any) => {
          if (a.OT_NT_BEL == 'Romantiek') {
            return a;
          }
        });
        this.outestament = this.boeke.filter((a: any) => {
          if (a.OT_NT_BEL == 'Ou Testament') {
            return a;
          }
        });
        this.nuwetestament = this.boeke.filter((a: any) => {
          if (a.OT_NT_BEL == 'Nuwe Testament') {
            return a;
          }
        });
        this.belydenisse = this.boeke.filter((a: any) => {
          if (a.OT_NT_BEL == 'Belydenisse') {
            return a;
          }
        });
        this.retrieveBronne();
      },
      (error) => {
        console.log(error);
      },
    );
  }

  retrieveFinaalPreke(): void {
    this.finaalPrekeService.getAll().subscribe(
      (data) => {
        this.finaal_preke = data;
        this.retrieveBoeke();
      },
      (error) => {
        console.log(error);
      },
    );
  }

  retrievePreke(): void {
    this.prekeService.getAll().subscribe(
      (data) => {
        this.preke = data;
        this.retrieveFinaalPreke();
      },
      (error) => {
        console.log(error);
      },
    );
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.retrievePreke();
  }

  openDialog(enkelePreek: any) {
    let dialogRef = this.dialog.open(ExampleDialogComponent, {
      width: '500px',
      data: enkelePreek,
    });
  }
async handleCheckboxClick(boek: any, event: MouseEvent): Promise<void> {
  event.preventDefault(); // Prevent the checkbox from changing state immediately.

  const shouldCheck = await this.openHoofstukkeDialog(boek);
  if (shouldCheck) {
    boek.checked = !boek.checked; // Only change the checked state if the condition is met.
  }
}

  openHoofstukkeDialog(boek: any): Promise<boolean> {
    console.log('boek: ',boek);
    console.log('this.mergedBronne: ',this.mergedBronne);
    this.relevantChapters = this.mergedBronne.filter(
      (item: any) => item.BoekNo === Number(boek.BoekNo),
    );

    this.relevantChapters = (
      [
        ...new Set(
          this.relevantChapters.map((item: any) => Number(item.Hoofstuk)),
        ),
      ] as number[]
    ).sort((a, b) => a - b);
    const dataToSend = {
      boek: boek.Boek,
      boekno: boek.BoekNo,
      relevantChapters: this.relevantChapters,
      checkedChaptersState: this.checkedChaptersState,
    };
  // Return a new Promise
  return new Promise<boolean>((resolve) => {
    const dialogRef = this.dialog.open(HoofstukkeDialogComponent, {
      data: dataToSend,
    });

    dialogRef.afterClosed().subscribe((returnData) => {
      let onlyChapters = returnData.checkedStates;
      let checkedChapters = onlyChapters.filter(
        (chapter: any) => chapter.checked,
      );

      checkedChapters.forEach((checkedChapter: any) => {
        this.myCheckedChapters.push(checkedChapter);
      });

      this.checkedChaptersState = this.checkedChaptersState.filter(
        (item: any) =>
          !onlyChapters.some(
            (returnItem: any) => returnItem.boek === item.boek,
          ),
      );

      this.checkedChaptersState = [
        ...this.checkedChaptersState,
        ...onlyChapters,
      ];
      let checkedCount = returnData.checkedStates.filter((chapter: any) => chapter.checked).length;

    resolve(checkedCount > 0);
    console.log('checkedCount: ',checkedCount);
    console.log('this.checkedChaptersState: ',this.checkedChaptersState);
    console.log('this.myCheckedChapters: ',this.myCheckedChapters);
    });
  });
  }
}
