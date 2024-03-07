import { Component, OnInit, OnDestroy } from '@angular/core';
import { LanguageService } from './services/site_taal.service';  // Update the path
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'fe-preke-vd-waal';
  language: string = '';
  private langSubscription!: Subscription;

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.langSubscription = this.languageService.currentLanguage.subscribe(lang => {
      this.language = lang;
    });
  }

  toggleLanguage(event: any): void {
    const newLanguage = event.target.checked ? 'Nederlands' : 'Afrikaans';
    this.languageService.changeLanguage(newLanguage);
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
