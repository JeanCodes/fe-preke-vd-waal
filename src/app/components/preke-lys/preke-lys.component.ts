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
  isOldTestamentVisible: boolean = false;
  isNewTestamentVisible: boolean = false;
  isBelTestamentVisible: boolean = false;
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
    begin: '1941',
    eind: '1980',
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
    this.isOldTestamentVisible = false;
    this.isNewTestamentVisible = false;
    this.isBelTestamentVisible = false;
    this.retrievePrekeIndeks();
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

  uncheckAllFilters(): void {
    this.outestament.forEach((boek: any) => {
      boek.checked = false;
    });
    this.nuwetestament.forEach((boek: any) => {
      boek.checked = false;
    });
    this.belydenisse.forEach((boek: any) => {
      boek.checked = false;
    });
    this.checkedChaptersState = [];
    this.myCheckedChapters = [];
    this.filters = {
      tema: '',
      digitaalpreke: '',
      id: '',
      taal: 'Als',
      bron: 'Als',
      vorm: 'Als',
      begin: '1941',
      eind: '1980',
      eenjaar: '',
      skandering: 'Als',
      teksopsie: 'Als',
    };
    this.isBelTestamentVisible = false;
    this.isNewTestamentVisible = false;
    this.isOldTestamentVisible = false;
  }

  filterPreke() {
    this.myFinalFilters = [];
    if (this.filters.eenjaar && this.filters.eenjaar.length > 0) {
      const filteredData = this.mergedDigitaalPreke.filter(
        (item: any) => Number(item.jaar) === Number(this.filters.eenjaar),
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
      const filteredData = this.mergedDigitaalPreke.filter((item: any) => {
        const jaar = Number(item.jaar);
        return jaar >= begin && jaar <= eind;
      });
      this.myFinalFilters.push(...filteredData);
    } else if (this.filters.begin && this.filters.begin.length > 0) {
      const begin = Number(this.filters.begin);
      const filteredDataBegin = this.mergedDigitaalPreke.filter(
        (item: any) => Number(item.jaar) >= begin,
      );
      this.myFinalFilters.push(...filteredDataBegin);
    } else if (this.filters.eind && this.filters.eind.length > 0) {
      const eind = Number(this.filters.eind);
      const filteredDataEind = this.mergedDigitaalPreke.filter(
        (item: any) => Number(item.jaar) <= eind,
      );
      this.myFinalFilters.push(...filteredDataEind);
    }

    if (this.filters.id && this.filters.id.length > 0) {
      const filteredData = this.mergedDigitaalPreke.filter(
        (item: any) => Number(item.nr) === Number(this.filters.id),
      );
      this.myFinalFilters.push(...filteredData);
    }

    if (this.filters.teksopsie != 'Als' && this.filters.teksopsie != 'Almal') {
      const filteredDataTeksOpsie = this.myFinalFilters.filter(
        (item: any) => item.pl === this.filters.teksopsie,
      );
      this.myFinalFilters = filteredDataTeksOpsie;
    }

    if (this.filters.taal != 'Als' && this.filters.taal != 'Almal') {
      const filteredDataTaal = this.myFinalFilters.filter(
        (item: any) => item.taal === this.filters.taal,
      );
      this.myFinalFilters = filteredDataTaal;
    }

    if (this.filters.bron != 'Als' && this.filters.bron != 'Almal') {
      const filteredDataBron = this.myFinalFilters.filter(
        (item: any) => item.bron === this.filters.bron,
      );
      this.myFinalFilters = filteredDataBron;
    }

    if (this.filters.vorm != 'Als' && this.filters.vorm != 'Almal') {
      const filteredDataVorm = this.myFinalFilters.filter(
        (item: any) => item.vorm === this.filters.vorm,
      );
      this.myFinalFilters = filteredDataVorm;
    }

    if (this.myCheckedChapters && this.myCheckedChapters.length > 0) {
      this.myFinalFilters = this.myFinalFilters.filter((finalFilterItem: any) =>
        this.myCheckedChapters.some(
          (checkedChapter) =>
            Number(finalFilterItem.h_stuk) === Number(checkedChapter.chapter) &&
            Number(finalFilterItem.boek) === Number(checkedChapter.boekno),
        ),
      );
    }

    this.myFinalFilters = this.myFinalFilters.filter((item: any) => {
      return (
        this.filters.tema === '' ||
        item.tema.toLowerCase().includes(this.filters.tema.toLowerCase())
      );
    });

    this.myFinalFilters = this.myFinalFilters.filter((item: any) => {
      return (
        this.filters.digitaalpreke === '' ||
        item.content.toLowerCase().includes(this.filters.digitaalpreke.toLowerCase())
      );
    });

    console.log('this.digitaalpreke: ', this.digitaalpreke);

    if (this.myCheckedChapters && this.myCheckedChapters.length > 0) {
      this.myFinalFilters = this.myFinalFilters.filter((finalFilterItem: any) =>
        this.myCheckedChapters.some(
          (checkedChapter: any) =>
            Number(finalFilterItem.boek) === Number(checkedChapter.boekno) &&
            Number(checkedChapter.chapter) === Number(finalFilterItem.h_stuk),
        ),
      );
    }
    interface MyFinalFilterItem {
      id: number;
      nr: number;
      jaar: number;
      taal: string;
      teks: string;
      boek: number;
      h_stuk: number;
      pl: string;
      tema: string;
      vorm: string;
      bron: string;
      boek_afk: string;
      boek_vol: string;
      createdAt: string;
      updatedAt: string;
    }
    const unique = new Map<number, MyFinalFilterItem>();
    this.myFinalFilters.forEach((item: MyFinalFilterItem) => {
      const existingItem = unique.get(item.nr);
      if (!existingItem) {
        unique.set(item.nr, item);
      } else {
        if (item.pl === 'P' && existingItem.pl !== 'P') {
          unique.set(item.nr, item);
        }
      }
    });
    this.myFinalFilters = Array.from(unique.values());

    this.myFinalFilters.sort((a: any, b: any) => a.nr - b.nr);

    this.prekeCount = this.myFinalFilters.length;

    this.uncheckAllFilters();
    console.log('this.myFinalFilters: ', this.myFinalFilters);
    this.loading = false;
    console.log('loading: ',this.loading);
  }

  mergePreke() {
    this.loading = true;
    this.mergedDigitaalPreke = [];

    this.prekeindeks.forEach((mergedPrekeItem: any) => {
      const match = this.digitaalpreke.filter(
        (itmInner: any) =>
          Number(itmInner.fileName.substring(0, 4)) ===
          Number(mergedPrekeItem.nr),
      );
      if (match[0]) {
        this.mergedDigitaalPreke.push({
          ...mergedPrekeItem,
          content: match[0].content,
        });
      } else {
        this.mergedDigitaalPreke.push(mergedPrekeItem);
      }
    });

    //    this.mergedDigitaalPreke.forEach((mergedPrekeItem: any) => {
    //      const match = this.boeke.filter(
    //        (itmInner: any) => itmInner.BoekNo === mergedPrekeItem.boek,
    //      );
    //      if (match) {
    //        this.mergedBoeke.push({
    //          ...mergedPrekeItem,
    //          ...match,
    //        });
    //      } else {
    //        this.mergedBoeke.push(mergedPrekeItem);
    //      }
    //    });

    this.filterPreke();
  }

  retrieveBronne(): void {
    this.bronneService.getAll().subscribe(
      (data) => {
        this.bronne = data;
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

  retrieveDigitaalPreke(): void {
    this.digitaalPrekeService.getAll().subscribe(
      (data) => {
        this.digitaalpreke = data;
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

  downloadRomantiek(): void {
    const pdfUrl =
      'https://prekevdwaal.s3.eu-west-1.amazonaws.com/preke/Romantiek.docx';
    window.open(pdfUrl, '_blank');
  }

  onTableDataChange(event: any) {
    this.page = event;
  }

  async handleCheckboxClick(boek: any, event: MouseEvent): Promise<void> {
    event.preventDefault(); // Prevent the checkbox from changing state immediately.
    const shouldCheck = await this.openHoofstukkeDialog(boek);
    boek.checked = shouldCheck;
  }

  openHoofstukkeDialog(boek: any): Promise<boolean> {
    this.relevantChapters = this.mergedDigitaalPreke.filter(
      (item: any) => item.boek === Number(boek.BoekNo),
    );
    this.relevantChapters = (
      [
        ...new Set(
          this.relevantChapters.map((item: any) => Number(item.h_stuk)),
        ),
      ] as number[]
    ).sort((a, b) => a - b);
    const dataToSend = {
      boek: boek.Boek,
      boekno: boek.BoekNo,
      relevantChapters: this.relevantChapters,
      checkedChaptersState: this.checkedChaptersState,
    };
    return new Promise<boolean>((resolve) => {
      const dialogRef = this.dialog.open(HoofstukkeDialogComponent, {
        data: dataToSend,
      });
      dialogRef.afterClosed().subscribe((returnData) => {
        this.myCheckedChapters = this.myCheckedChapters.filter(
          (chapter: any) => chapter.boek !== boek.Boek,
        );
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
        let checkedCount = returnData.checkedStates.filter(
          (chapter: any) => chapter.checked,
        ).length;
        resolve(checkedCount > 0);
      });
    });
  }
}
