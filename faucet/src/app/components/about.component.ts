import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-8">About Bitcoin Testnet</h2>

      <div class="bg-white shadow-lg rounded-lg p-6 space-y-6">
        <p class="text-gray-600 leading-relaxed">
          The Bitcoin Testnet is a parallel blockchain to the Bitcoin Mainnet, designed specifically
          for developers, testers, and enthusiasts to experiment without financial risk.
        </p>

        <div class="space-y-4">
          <h3 class="text-xl font-semibold text-primary">Why Use the Bitcoin Testnet?</h3>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-start">
              <svg class="w-6 h-6 text-primary mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span><strong class="text-gray-900">Risk-Free Testing:</strong> Experiment without financial risk</span>
            </li>
            <!-- Add more list items similarly -->
          </ul>
        </div>

        <div class="space-y-4">
          <h3 class="text-xl font-semibold text-primary">How Does It Work?</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Separate Blockchain</h4>
              <p class="text-gray-600">Distinct from Bitcoin's Mainnet</p>
            </div>
            <!-- Add more info boxes similarly -->
          </div>
        </div>

        <div class="bg-primary/5 p-6 rounded-lg border border-primary/10">
          <h3 class="text-xl font-semibold text-primary mb-4">Important Notes</h3>
          <p class="text-gray-600">
            Remember: Testnet is for testing purposes only. Never use it for real transactions.
          </p>
        </div>
      </div>
    </div>
  `
})
export class AboutComponent {}
