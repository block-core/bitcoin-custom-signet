import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-8">Help & FAQs</h2>

      <!-- How to Use Section -->
      <div class="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h3 class="text-xl font-semibold text-primary mb-4">How to Use This Faucet?</h3>
        <ol class="space-y-4 text-gray-600">
          <li class="flex items-start">
            <span class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3">1</span>
            <span>Go to the <a [routerLink]="['/claim']" class="text-primary hover:underline">Claim</a> page.</span>
          </li>
          <li class="flex items-start">
            <span class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3">2</span>
            <span>Enter your Bitcoin Testnet address.</span>
          </li>
          <li class="flex items-start">
            <span class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3">3</span>
            <span>Specify the amount (up to <strong>0.001 BTC</strong>).</span>
          </li>
          <li class="flex items-start">
            <span class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3">4</span>
            <span>Click the "Claim Bitcoin" button and wait for the transaction to complete.</span>
          </li>
        </ol>
      </div>

      <!-- FAQ Section -->
      <div class="space-y-4">
        <h3 class="text-xl font-semibold text-primary mb-4">Frequently Asked Questions</h3>

        <div class="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
          <div class="p-6">
            <h4 class="text-lg font-medium text-gray-900 mb-2">What is Bitcoin Testnet?</h4>
            <p class="text-gray-600">
              Bitcoin Testnet is a parallel blockchain used for testing and experimentation.
              The coins on this network have no real-world value.
            </p>
          </div>
          <div class="p-6">
            <h4 class="text-lg font-medium text-gray-900 mb-2">How do I get a Bitcoin Testnet wallet?</h4>
            <p class="text-gray-600">
              You can download Testnet-compatible wallets such as Electrum or Bitcoin Core.
              Make sure the wallet is configured to use Testnet.
            </p>
          </div>
          <div class="p-6">
            <h4 class="text-lg font-medium text-gray-900 mb-2">Can I use Testnet Bitcoin on the Mainnet?</h4>
            <p class="text-gray-600">
              No, Testnet Bitcoins are only valid on the Testnet and cannot be used on the Bitcoin Mainnet.
            </p>
          </div>
          <div class="p-6">
            <h4 class="text-lg font-medium text-gray-900 mb-2">Why is my transaction taking time?</h4>
            <p class="text-gray-600">
              Testnet transactions rely on Testnet miners. If there are fewer miners, transactions may take longer.
              This is normal for Testnet.
            </p>
          </div>
          <div class="p-6">
            <h4 class="text-lg font-medium text-gray-900 mb-2">Is there a limit to how much I can claim?</h4>
            <p class="text-gray-600">
              Yes, the maximum amount per claim is <strong>0.001 BTC</strong> to ensure fair usage for everyone.
            </p>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="mt-8 bg-primary/5 rounded-lg p-6 border border-primary/10">
        <h3 class="text-xl font-semibold text-primary mb-4">Need Further Assistance?</h3>
        <p class="text-gray-600 mb-4">If you have additional questions or issues, reach out to us:</p>
        <a href="https://www.blockcore.net/discord"
           target="_blank"
           class="inline-flex items-center text-primary hover:text-primary-dark">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515..."/>
          </svg>
          Join our Discord
        </a>
      </div>
    </div>
  `
})
export class HelpComponent {}
