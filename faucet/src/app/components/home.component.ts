import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#cbdde1] to-white">
      <!-- Hero Section -->
      <section class="py-24 px-4 md:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col md:flex-row items-center justify-between gap-16">
            <div class="flex-1 text-center md:text-left space-y-8" @fadeIn>
              <h1 class="text-5xl md:text-6xl font-bold text-[#022229] leading-tight">
                Bitcoin Testnet <span class="text-[#086c81]">Faucet</span>
              </h1>
              <p class="text-xl text-[#022229]/80 leading-relaxed">
                Get started with Bitcoin development using our secure and reliable testnet faucet. Instant claims, seamless experience.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button [routerLink]="['/claim']"
                        class="px-8 py-4 rounded-lg bg-gradient-to-r from-[#022229] to-[#086c81] text-white font-semibold hover:from-[#086c81] hover:to-[#022229] transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Claim Bitcoin Now
                </button>
                <button class="px-8 py-4 rounded-lg border-2 border-[#022229] text-[#022229] font-semibold hover:bg-[#022229] hover:text-white transform hover:scale-105 transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>
            <div class="flex-1" @fadeIn>
              <img src="faucet.png" alt="Bitcoin Illustration"
                   class="w-full max-w-lg mx-auto drop-shadow-2xl animate-float">
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="py-20 px-4 md:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-bold text-center text-[#022229] mb-16">
            How It Works
          </h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div *ngFor="let step of steps; let i = index"
                 [@fadeIn]
                 [style.animation-delay]="(i * 200) + 'ms'"
                 class="group p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-[#cbdde1]">
              <div class="flex items-center space-x-4 mb-6">
                <div class="w-14 h-14 bg-gradient-to-br from-[#022229] to-[#086c81] text-white rounded-2xl flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform duration-300">
                  {{step.number}}
                </div>
                <div class="h-0.5 flex-1 bg-gradient-to-r from-[#cbdde1] to-transparent"></div>
              </div>
              <h3 class="text-xl font-bold text-[#022229] mb-4 group-hover:text-[#086c81] transition-colors">
                {{step.title}}
              </h3>
              <p class="text-[#022229]/70 leading-relaxed">
                {{step.description}}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
  `]
})
export class HomeComponent implements OnInit {
  steps = [
    {
      number: 1,
      title: 'Enter Your Wallet Address',
      description: 'Simply paste your Bitcoin testnet wallet address in our secure form to begin.'
    },
    {
      number: 2,
      title: 'Specify Amount',
      description: 'Select how much test Bitcoin you need (up to 0.1 BTC per request).'
    },
    {
      number: 3,
      title: 'Receive Instantly',
      description: 'Click claim and receive your test Bitcoin directly to your wallet within seconds.'
    }
  ];

  ngOnInit() {
    // Component initialization
  }
}
