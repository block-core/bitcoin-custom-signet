import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="min-h-screen flex flex-col">
      <header class="sticky top-0 bg-[#022229] backdrop-blur text-white py-4 shadow-md z-50">
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center">
            <div class="logo">
              <a [routerLink]="['/']" class="text-2xl font-bold hover:text-[#cbdde1] transition-colors">Bitcoin Faucet</a>
            </div>
            <ul class="flex space-x-6">
              <li><a [routerLink]="['/claim']" routerLinkActive="text-[#086c81]" class="hover:text-[#cbdde1] transition-colors">Claim</a></li>
              <li><a [routerLink]="['/about']" routerLinkActive="text-[#086c81]" class="hover:text-[#cbdde1] transition-colors">About</a></li>
              <li><a [routerLink]="['/help']" routerLinkActive="text-[#086c81]" class="hover:text-[#cbdde1] transition-colors">Help</a></li>
            </ul>
          </div>
        </nav>
      </header>

      <main class="flex-1 bg-gradient-to-b from-[#cbdde1]/30 to-white">
        <router-outlet></router-outlet>
      </main>

      <footer class="bg-[#022229] text-white py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p class="text-sm">&copy; {{currentYear}} Bitcoin Faucet</p>
           
          </div>
        </div>
      </footer>
    </div>
  `
})
export class LayoutComponent {
  currentYear = new Date().getFullYear();
}
