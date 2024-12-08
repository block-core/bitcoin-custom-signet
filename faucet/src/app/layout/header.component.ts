import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  template: `
    <header>
      <nav>
        <div class="logo">
          <a [routerLink]="['/']">Bitcoin Faucet</a>
        </div>
        <ul class="nav-links">
          <li><a [routerLink]="['/about']">About</a></li>
          <li><a [routerLink]="['/help']">Help</a></li>
        </ul>
      </nav>
    </header>
  `,
  styles: [`
  `]
})
export class HeaderComponent {

}
