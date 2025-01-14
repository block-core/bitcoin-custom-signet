import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="min-h-screen flex flex-col">
      <header class="sticky top-0 bg-primary/95 backdrop-blur text-white py-4 shadow-md z-50">
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center">
            <div class="logo">
              <a [routerLink]="['/']" class="text-2xl font-bold">Bitcoin Faucet</a>
            </div>
            <ul class="flex space-x-6">
              <li><a [routerLink]="['/about']" class="hover:text-primary-light">About</a></li>
              <li><a [routerLink]="['/help']" class="hover:text-primary-light">Help</a></li>
            </ul>
          </div>
        </nav>
      </header>

      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <footer class="bg-primary text-white py-4 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p class="text-sm text-center">&copy; 2024 Bitcoin Faucet | <a href="#" class="text-primary-light hover:underline">Privacy Policy</a></p>
        </div>
      </footer>
    </div>
  `
})
export class LayoutComponent {}
