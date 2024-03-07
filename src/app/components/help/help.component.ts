import { Component, OnInit, OnDestroy } from '@angular/core';
import { LanguageService } from '../../services/site_taal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css'],
})
export class HelpComponent implements OnInit, OnDestroy {
  public currentLanguage: string = ''; // Added this line
  private langSubscription!: Subscription;

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.langSubscription = this.languageService.currentLanguage.subscribe(
      (lang) => {
        this.currentLanguage = lang; // Updated this line to set the currentLanguage variable
        console.log(lang);
      },
    );
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
