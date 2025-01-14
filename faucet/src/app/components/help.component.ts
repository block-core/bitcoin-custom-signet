import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div class="max-w-5xl mx-auto px-4">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Help Center
          </h1>
          <p class="mt-4 text-xl text-gray-500">
            Everything you need to know about using our Bitcoin Testnet Faucet
          </p>
        </div>
        <!-- Quick Start Guide -->
        <div
          class="bg-white rounded-2xl shadow-xl p-8 mb-10 transform hover:scale-[1.02] transition-transform duration-300"
        >
          <h3 class="text-2xl font-bold text-primary mb-6">
            Quick Start Guide
          </h3>
          <div class="grid md:grid-cols-2 gap-8">
            <div class="space-y-6">
              <div
                class="flex items-center space-x-4 p-4 bg-primary/5 rounded-xl"
              >
                <div
                  class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold"
                >
                  1
                </div>
                <p class="text-gray-700">
                  Navigate to the
                  <a
                    [routerLink]="['/claim']"
                    class="text-primary hover:text-primary-dark font-medium"
                    >Claim page</a
                  >
                </p>
              </div>
              <div
                class="flex items-center space-x-4 p-4 bg-primary/5 rounded-xl"
              >
                <div
                  class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold"
                >
                  2
                </div>
                <p class="text-gray-700">Enter your Bitcoin Testnet address</p>
              </div>
            </div>
            <div class="space-y-6">
              <div
                class="flex items-center space-x-4 p-4 bg-primary/5 rounded-xl"
              >
                <div
                  class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold"
                >
                  3
                </div>
                <p class="text-gray-700">
                  Specify amount (max:
                  <span class="font-semibold">0.001 BTC</span>)
                </p>
              </div>
              <div
                class="flex items-center space-x-4 p-4 bg-primary/5 rounded-xl"
              >
                <div
                  class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold"
                >
                  4
                </div>
                <p class="text-gray-700">
                  Click "Claim Bitcoin" and wait for confirmation
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQs -->
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-10">
          <h3 class="text-2xl font-bold text-primary mb-6">
            Frequently Asked Questions
          </h3>
          <div class="grid gap-6">
            <div
              class="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300"
            >
              <h4 class="text-xl font-semibold text-gray-900 mb-3">
                What is Bitcoin Testnet?
              </h4>
              <p class="text-gray-700 leading-relaxed">
                Bitcoin Testnet is a parallel network designed for testing and
                development. It mirrors the main Bitcoin network but uses
                worthless coins, making it perfect for experimentation.
              </p>
            </div>
            <div
              class="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300"
            >
              <h4 class="text-xl font-semibold text-gray-900 mb-3">
                How do I get started?
              </h4>
              <p class="text-gray-700 leading-relaxed">
                Download a Testnet-compatible wallet like Electrum or Bitcoin
                Core. Configure it for Testnet use, and you're ready to start
                testing.
              </p>
            </div>
            <div
              class="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300"
            >
              <h4 class="text-xl font-semibold text-gray-900 mb-3">
                Transaction Times
              </h4>
              <p class="text-gray-700 leading-relaxed">
                Testnet transactions may take longer than mainnet due to fewer
                miners. This is normal and part of the testing environment.
              </p>
            </div>
          </div>
        </div>

        <!-- Support Section -->
        <div
          class="bg-gradient-to-r from-primary to-primary-dark rounded-2xl shadow-xl p-8 text-white"
        >
          <div class="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold mb-4">Need Help?</h3>
              <p class="text-white/90 mb-4">
                Join our community for support and discussions
              </p>
            </div>
            <a
              href="https://www.blockcore.net/discord"
              target="_blank"
              class="inline-flex items-center px-6 py-3 bg-white text-primary rounded-xl hover:bg-gray-100 transition-colors duration-300"
            >
              Join Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HelpComponent { }
