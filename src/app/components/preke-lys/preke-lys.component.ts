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
  isRomantiekVisible = false;

  toggleRomantiekVisibility() {
    this.isRomantiekVisible = !this.isRomantiekVisible;
  }
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
    this.preFilter = this.mergedBronne;
    if (this.filters.eenjaar && this.filters.eenjaar.length > 0) {
      const filteredData = this.mergedBronne.filter(
        (item: any) => Number(item.Jaar) === Number(this.filters.eenjaar),
      );
      this.myFinalFilters.push(...filteredData);
    }

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
    } else if (this.filters.eind && this.filters.eind.length > 0) {
      const eind = Number(this.filters.eind);

      const filteredDataEind = this.mergedBronne.filter(
        (item: any) => Number(item.Jaar) <= eind,
      );

      this.myFinalFilters.push(...filteredDataEind);
    }

    if (this.filters.id && this.filters.id.length > 0) {
      const filteredData = this.mergedBronne.filter(
        (item: any) => Number(item.PreekNo) === Number(this.filters.id),
      );
      this.myFinalFilters.push(...filteredData);
    }

    if (this.filters.tema && this.filters.tema.length > 0) {
      const filteredDataTema = this.mergedBronne.filter(
        (item: any) => item.Tema && item.Tema.includes(this.filters.tema),
      );
      this.myFinalFilters.push(...filteredDataTema);
    }
    console.log('this.filters.teksopsie: ', this.filters.teksopsie);
    if (this.filters.teksopsie != 'Als' && this.filters.teksopsie != 'Almal') {
      const filteredDataTeksOpsie = this.mergedBronne.filter(
        (item: any) => item.P_L_B === this.filters.teksopsie,
      );
      this.mergedBronne = filteredDataTeksOpsie;
    }

    if (this.filters.taal != 'Als' && this.filters.taal != 'Almal') {
      const filteredDataTaal = this.mergedBronne.filter(
        (item: any) => item.Taal === this.filters.taal,
      );
      this.mergedBronne = filteredDataTaal;
    }
    console.log('this.mergedBronne1: ', this.mergedBronne);
    console.log('this.myFinalFilters1: ', this.myFinalFilters);
    console.log('this.filters: ', this.filters);
    if (this.filters.bron != 'Als' && this.filters.bron != 'Almal') {
      const filteredDataBron = this.mergedBronne.filter(
        (item: any) => item.Bron === this.filters.bron,
      );
      this.mergedBronne = filteredDataBron;
      console.log('this.mergedBronne First Inner: ', this.mergedBronne);
    }
    //    if (
    //      (this.filters.bron != 'Als' && this.filters.bron != 'Almal') ||
    //      (this.filters.taal != 'Als' && this.filters.taal != 'Almal') ||
    //      (this.filters.teksopsie != 'Als' && this.filters.teksopsie != 'Almal')
    //    ) {
    //      this.myFinalFilters.push(...this.mergedBronne);
    //    }
    //    console.log('this.myFinalFiltersSecondLast: ', this.myFinalFilters);
    //    console.log('this.mergedBronne2: ', this.mergedBronne);
    //    this.mergedBronne = this.mergedBronne.filter(
    //      (bron: any) => bron.checked === true,
    //    );
    //    console.log('this.mergedBronne2.5: ', this.mergedBronne);
    this.checkedChaptersState = this.checkedChaptersState.filter(
      (item: any) => item.checked,
    );
    //    console.log('this.mergedBronne3: ', this.mergedBronne);
    //    console.log('this.checkedChaptersState: ', this.checkedChaptersState);
    //    console.log('this.myCheckedChapters: ',this.myCheckedChapters);
    //    this.mergedBronne = this.mergedBronne.filter((mergedItem: any) =>
    //      this.myCheckedChapters.some(
    //        (checkedItem) =>
    //          checkedItem.boek === mergedItem.Boek &&
    //          checkedItem.chapter === Number(mergedItem.Hoofstuk),
    //      ),
    //    );
    console.log('this.mergedBronne4: ', this.mergedBronne);
    console.log('this.myFinalFilters: ', this.myFinalFilters);
    this.myFinalFilters.push(...this.mergedBronne);
    this.myFinalFilters = this.myFinalFilters.map((item: any) => {
      if (item['0']) {
        return {
          ...item,
          KortBeskrywing: item['0'].KortBeskrywing,
        };
      } else {
        return item;
      }
    });
    console.log('this.myFinalFilters: ', this.myFinalFilters);
    this.mergedBronne = this.myFinalFilters;
    this.mergedBronne = this.mergedBronne.filter(
      (itmInner: any) => itmInner.P_L_B === 'P',
    );
    console.log('this.mergedBronne: ', this.mergedBronne);
    this.mergedBronne.sort((a: any, b: any) => a.PreekNo - b.PreekNo);
    this.prekeCount = this.mergedBronne.length;
    //   this.filters = {
    //     tema: '',
    //     id: '',
    //     taal: 'Als',
    //     bron: 'Als',
    //     begin: '',
    //     eind: '',
    //     eenjaar: '',
    //     skandering: 'Als',
    //     teksopsie: 'Als',
    //   };

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

  openHoofstukkeDialog(boek: any) {
    this.relevantChapters = this.preFilter.filter(
      (item: any) => item.BoekNo === 33,
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
    });
  }
}
