import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <div class="bg-gray-50">
      <!-- Hero Section -->
      <section class="py-20 px-4 md:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col md:flex-row items-center justify-between gap-12">
            <div class="flex-1 text-center md:text-left space-y-6">
              <h1 class="text-4xl md:text-5xl font-bold text-gray-900 opacity-0 transform translate-y-4 transition-all duration-700 ease-out"
                  [class.opacity-100]="true" [class.translate-y-0]="true">
                Welcome to Bitcoin Faucet
              </h1>
              <p class="text-xl text-gray-600 opacity-0 transform translate-y-4 transition-all duration-700 delay-200 ease-out"
                 [class.opacity-100]="true" [class.translate-y-0]="true">
                Claim free Bitcoin instantly with your Testnet wallet address. Simple and secure!
              </p>
              <button [routerLink]="['/claim']"
                      class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 opacity-0 transform translate-y-4 transition-all duration-700 delay-400 ease-out"
                      [class.opacity-100]="true" [class.translate-y-0]="true">
                Get Bitcoin Now
              </button>
            </div>
            <div class="flex-1">
              <img src="faucet.png" alt="Bitcoin Faucet Illustration"
                   class="w-full max-w-md mx-auto opacity-0 transform translate-x-4 transition-all duration-700 delay-500 ease-out"
                   [class.opacity-100]="true" [class.translate-x-0]="true">
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="py-16 px-4 md:px-6 lg:px-8 bg-white">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="step p-6 rounded-lg bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                 *ngFor="let step of steps">
              <div class="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                {{step.number}}
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                {{step.title}}
              </h3>
              <p class="text-gray-600">
                {{step.description}}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class HomeComponent {
  steps = [
    {
      number: 1,
      title: 'Enter Your Wallet Address',
      description: 'Provide your Testnet Bitcoin address to receive rewards.'
    },
    {
      number: 2,
      title: 'Enter the Amount',
      description: 'Specify the amount (less than 0.1 BTC test).'
    },
    {
      number: 3,
      title: 'Claim Your Bitcoin',
      description: 'Submit your request and get your free Bitcoin instantly!'
    }
  ];
}
