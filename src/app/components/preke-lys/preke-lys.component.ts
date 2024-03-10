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
import { DigitaalPrekeService } from 'src/app/services/digitaalpreke.service';
import { PrekeIndeksService } from 'src/app/services/preke_indeks.service';

@Component({
  selector: 'app-preke-lys',
  templateUrl: './preke-lys.component.html',
  styleUrls: ['./preke-lys.component.css'],
})
export class PrekeLysComponent implements OnInit {
  boeke: any;
  preke: any;
  prekeindeks: any;
  digitaalpreke: any;
  finaal_preke: any;
  bronne: any;
  tekste: any;
  mergedPreke: any = [];
  mergedBoeke: any = [];
  mergedBronne: any = [];
  mergedDigitaalPreke: any = [];
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
  myCheckedChapters: {
    boek: string;
    boekno: number;
    chapter: number;
    checked: boolean;
  }[] = [];
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
    digitaalpreke: '',
    id: '',
    taal: 'Als',
    bron: 'Als',
    vorm: 'Als',
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
    private digitaalPrekeService: DigitaalPrekeService,
    private prekeIndeksService: PrekeIndeksService,
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
    //    this.retrievePreke();
    this.retrievePrekeIndeks();
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

  uncheckAllBooks(): void {
    this.outestament.forEach((boek: any) => {
      boek.checked = false;
    });
    this.nuwetestament.forEach((boek: any) => {
      boek.checked = false;
    });
    this.belydenisse.forEach((boek: any) => {
      boek.checked = false;
    });
    this.isBelTestamentVisible = false;
    this.isNewTestamentVisible = false;
    this.isOldTestamentVisible = false;
  }

  filterPreke() {
    this.myFinalFilters = [];
    console.log('this.mergedBronne: ', this.mergedBronne);
    // Apply 1 Jaar Filter
    if (this.filters.eenjaar && this.filters.eenjaar.length > 0) {
      const filteredData = this.mergedBronne.filter(
        (item: any) => Number(item.jaar) === Number(this.filters.eenjaar),
      );
      this.myFinalFilters.push(...filteredData);
    }
    console.log('this.myFinalFilters: ', this.myFinalFilters);
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
        const jaar = Number(item.jaar);
        return jaar >= begin && jaar <= eind;
      });
      this.myFinalFilters.push(...filteredData);
    } else if (this.filters.begin && this.filters.begin.length > 0) {
      const begin = Number(this.filters.begin);
      const filteredDataBegin = this.mergedBronne.filter(
        (item: any) => Number(item.jaar) >= begin,
      );
      this.myFinalFilters.push(...filteredDataBegin);
    } else if (this.filters.eind && this.filters.eind.length > 0) {
      const eind = Number(this.filters.eind);
      const filteredDataEind = this.mergedBronne.filter(
        (item: any) => Number(item.jaar) <= eind,
      );
      this.myFinalFilters.push(...filteredDataEind);
    }
    console.log('this.myFinalFilters1: ', this.myFinalFilters);

    // Adding Preek whose number was filled in
    if (this.filters.id && this.filters.id.length > 0) {
      const filteredData = this.mergedBronne.filter(
        (item: any) => Number(item.nr) === Number(this.filters.id),
      );
      this.myFinalFilters.push(...filteredData);
    }
    console.log('this.myFinalFilters2: ', this.myFinalFilters);
    console.log('this.filters: ', this.filters);

    //Filtering mergedBronne to only include teksopsies selected
    if (this.filters.teksopsie != 'Als' && this.filters.teksopsie != 'Almal') {
      const filteredDataTeksOpsie = this.myFinalFilters.filter(
        (item: any) => item.pl === this.filters.teksopsie,
      );
      this.myFinalFilters = filteredDataTeksOpsie;
    }
    console.log('this.myFinalFilters3: ', this.myFinalFilters);
    //Filtering mergedBronne to only include taal selected
    if (this.filters.taal != 'Als' && this.filters.taal != 'Almal') {
      const filteredDataTaal = this.myFinalFilters.filter(
        (item: any) => item.taal === this.filters.taal,
      );
      this.myFinalFilters = filteredDataTaal;
    }
    console.log('this.myFinalFilters4: ', this.myFinalFilters);
    //Filtering mergedBronne to only include bron selected
    if (this.filters.bron != 'Als' && this.filters.bron != 'Almal') {
      const filteredDataBron = this.myFinalFilters.filter(
        (item: any) => item.bron === this.filters.bron,
      );
      this.myFinalFilters = filteredDataBron;
    }
    //Filtering mergedBronne to only include bron selected
    if (this.filters.vorm != 'Als' && this.filters.vorm != 'Almal') {
      const filteredDataVorm = this.myFinalFilters.filter(
        (item: any) => item.vorm === this.filters.vorm,
      );
      this.myFinalFilters = filteredDataVorm;
    }
    console.log('this.myFinalFilters5: ', this.myFinalFilters);
    if (this.myCheckedChapters && this.myCheckedChapters.length > 0) {
      this.myFinalFilters = this.myFinalFilters.filter((finalFilterItem: any) =>
        this.myCheckedChapters.some(
          (checkedChapter) =>
            Number(finalFilterItem.h_stuk) === Number(checkedChapter.chapter) &&
            Number(finalFilterItem.boek) === Number(checkedChapter.boekno),
        ),
      );
    }
    console.log('this.myFinalFilters6: ', this.myFinalFilters);

    this.myFinalFilters = this.myFinalFilters.filter((item: any) => {
      return (
        this.filters.tema === '' ||
        item.tema.toLowerCase().includes(this.filters.tema.toLowerCase())
      );
    });
    console.log('this.myFinalFilters7: ', this.myFinalFilters);
    console.log('this.filters: ', this.filters);

    interface MyFinalFilterItem {
      id: number;
      nr: number;
      jaar: number;
      taal: string;
      teks: string;
      boek: number;
      h_stuk: number;
      pl: string; // Make sure 'pl' is part of your interface
      tema: string;
      vorm: string;
      bron: string;
      boek_afk: string;
      boek_vol: string;
      createdAt: string;
      updatedAt: string;
    }

    console.log('this.myFinalFilters9: ', this.myFinalFilters);

    // Initialize a map to track the unique nr with preference for 'P'
    const unique = new Map<number, MyFinalFilterItem>();

    this.myFinalFilters.forEach((item: MyFinalFilterItem) => {
      const existingItem = unique.get(item.nr);
      if (!existingItem) {
        // If no item with this 'nr' has been added yet, add the current item
        unique.set(item.nr, item);
      } else {
        // If an item with this 'nr' already exists, replace it only if the current item has 'pl' = 'P' and existing does not
        if (item.pl === 'P' && existingItem.pl !== 'P') {
          unique.set(item.nr, item);
        }
      }
    });

    this.myFinalFilters = Array.from(unique.values());

    this.myFinalFilters = Array.from(unique.values());

    console.log('this.myFinalFilters10: ', this.myFinalFilters);
    //Sorting myFinalFilters by PreekNo
    this.myFinalFilters.sort((a: any, b: any) => a.nr - b.nr);
    console.log('this.myFinalFilters11: ', this.myFinalFilters);
    this.prekeCount = this.myFinalFilters.length;
    this.filters = {
      tema: '',
      digitaalpreke: '',
      id: '',
      taal: 'Als',
      bron: 'Als',
      vorm: 'Als',
      begin: '',
      eind: '',
      eenjaar: '',
      skandering: 'Als',
      teksopsie: 'Als',
    };
    this.uncheckAllBooks();
    this.loading = false;
  }

  resetPage() {
    this.page = 1;
  }

  mergePreke() {
    this.loading = true;
    this.mergedBronne = [];
    this.mergedDigitaalPreke = [];
    this.mergedPreke = [];
    this.mergedBoeke = [];
    this.preke = this.finaal_preke;

    //    this.preke.forEach((prekeItem: any) => {
    //      const matches = this.tekste.filter(
    //        (itmInner: any) => itmInner.PreekNo === prekeItem.PreekNo,
    //      );
    //      matches.forEach((match: any) => {
    //        this.mergedPreke.push({
    //          ...prekeItem,
    //          ...match,
    //        });
    //      });
    //    });

    this.prekeindeks.forEach((mergedPrekeItem: any) => {
      const match = this.digitaalpreke.filter(
        (itmInner: any) => itmInner.preekno === mergedPrekeItem.nr,
      );
      if (match) {
        this.mergedDigitaalPreke.push({
          ...mergedPrekeItem,
          ...match,
        });
      } else {
        this.mergedDigitaalPreke.push(mergedPrekeItem);
      }
    });

    console.log('this.mergedDigitaalPreke: ', this.mergedDigitaalPreke);

    //    this.mergedPreke.forEach((mergedPrekeItem: any) => {
    //      const match = this.digitaalpreke.filter(
    //        (itmInner: any) => itmInner.preekno === mergedPrekeItem.PreekNo,
    //      );
    //      if (match) {
    //        this.mergedDigitaalPreke.push({
    //          ...mergedPrekeItem,
    //          ...match,
    //        });
    //      } else {
    //        this.mergedDigitaalPreke.push(mergedPrekeItem);
    //      }
    //    });

    this.mergedDigitaalPreke.forEach((mergedPrekeItem: any) => {
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

    //    this.mergedBoeke.forEach((mergedBoekeItem: any) => {
    //      const match = this.bronne.filter(
    //        (itmInner: any) => itmInner.BronNo === mergedBoekeItem.Bron,
    //      );
    //      if (match) {
    //        this.mergedBronne.push({
    //          ...mergedBoekeItem,
    //          ...match,
    //        });
    //      } else {
    //        this.mergedBronne.push(mergedBoekeItem);
    //      }
    //    });

    this.mergedBronne = this.mergedBoeke;

    this.checkedChaptersState = this.mergedBronne.map((item: any) => ({
      boek: item.Boek,
      chapter: parseInt(item.Hoofstuk, 10), // Convert the Hoofstuk string to a number
      checked: false,
    }));
    console.log('this.mergedBronne: ', this.mergedBronne);
    this.filterPreke();
  }

  //  retrieveTekste(): void {
  //    this.teksteService.getAll().subscribe(
  //      (data) => {
  //        this.tekste = data;
  //        this.mergePreke();
  //      },
  //      (error) => {
  //        console.log(error);
  //      },
  //    );
  //  }

  retrieveBronne(): void {
    this.bronneService.getAll().subscribe(
      (data) => {
        this.bronne = data;
        //        this.retrieveTekste();
        this.mergePreke();
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

  retrieveDigitaalPreke(): void {
    this.digitaalPrekeService.getAll().subscribe(
      (data) => {
        this.digitaalpreke = data;
        console.log('this.digitaalpreke: ', this.digitaalpreke);
        //this.retrieveFinaalPreke();
        this.retrieveBoeke();
      },
      (error) => {
        console.log(error);
      },
    );
  }

  retrievePrekeIndeks(): void {
    this.prekeIndeksService.getAll().subscribe(
      (data) => {
        this.prekeindeks = data;
        console.log('prekeindeks: ', this.prekeindeks);
        this.retrieveDigitaalPreke();
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
        this.retrievePrekeIndeks();
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
    boek.checked = shouldCheck;
  }

  openHoofstukkeDialog(boek: any): Promise<boolean> {
    console.log('boek: ', boek);
    console.log('this.mergedBronne: ', this.mergedBronne);
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
        this.myCheckedChapters = this.myCheckedChapters.filter(
          (chapter: any) => chapter.boek !== boek.Boek,
        );
        console.log('returnData: ', returnData);
        let onlyChapters = returnData.checkedStates;
        console.log('onlyChapters: ', onlyChapters);
        console.log('boek: ', boek);
        console.log('this.myCheckedChapters: ', this.myCheckedChapters);
        let checkedChapters = onlyChapters.filter(
          (chapter: any) => chapter.checked,
        );
        console.log('checkedChapters: ', checkedChapters);
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
        let checkedCount = returnData.checkedStates.filter(
          (chapter: any) => chapter.checked,
        ).length;

        resolve(checkedCount > 0);
        console.log('checkedCount: ', checkedCount);
        console.log('this.checkedChaptersState: ', this.checkedChaptersState);
        console.log('this.myCheckedChapters: ', this.myCheckedChapters);
      });
    });
  }
}
