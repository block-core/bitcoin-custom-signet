import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterModule],
  template: `
    <!-- Header -->
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

    <!-- Main Content -->
    <div class="content">
      <router-outlet></router-outlet>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <p>&copy; 2024 Bitcoin Faucet | <a href="#">Privacy Policy</a></p>
    </footer>
  `,
  styles: [`
    /* You can add all your styles here */
    .footer {
      /* Add your footer styles */
    }
  `]
})
export class LayoutComponent {
}
