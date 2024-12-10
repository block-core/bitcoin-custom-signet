import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ScrollService } from '../services/scroll.service';

@Component({
  selector: 'app-layout',
  standalone: true,
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
    <div class="main-content">
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
export class LayoutComponent implements OnInit {
  constructor(
    private router: Router,
    private scrollService: ScrollService
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.scrollService.scrollToTop();
    });
  }
}
