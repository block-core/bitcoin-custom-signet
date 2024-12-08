import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [HeaderComponent,FooterComponent,RouterModule],
  template: `
    <app-header></app-header>
    <div class="content">
      <router-outlet></router-outlet>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    /* Add your styles here */
  `]
})
export class MainLayoutComponent {

}
