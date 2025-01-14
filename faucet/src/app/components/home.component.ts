import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  animations: [
    trigger('staggerFade', [
      transition(':enter', [
        query('.stagger-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('500ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ]),
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#083344] via-[#0c4a5c] to-[#083344]">
      <!-- Hero Section -->
      <section class="relative py-20 lg:py-32 overflow-hidden">
        <!-- Background Elements -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute w-96 h-96 -top-10 -right-10 bg-[#0c4a5c]/30 rounded-full blur-3xl"></div>
          <div class="absolute w-96 h-96 -bottom-10 -left-10 bg-[#0c4a5c]/30 rounded-full blur-3xl"></div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <!-- Left Column -->
            <div class="text-center lg:text-left space-y-8" @fadeSlideIn>
              <h1 class="text-4xl md:text-6xl font-bold text-white leading-tight">
                Bitcoin Testnet
                <span class="block text-teal-300">Faucet Service</span>
              </h1>
              <p class="text-xl text-gray-300 leading-relaxed max-w-2xl">
                Start your blockchain journey with our reliable testnet faucet.
                Free testnet Bitcoin for developers and enthusiasts.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button [routerLink]="['/claim']"
                        class="px-8 py-4 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 text-white font-semibold
                               hover:from-teal-500 hover:to-teal-400 transform hover:scale-105 transition-all duration-300
                               shadow-lg hover:shadow-teal-500/25">
                  Get Test Bitcoin
                </button>
                <button [routerLink]="['/about']"
                        class="px-8 py-4 rounded-xl border-2 border-teal-400/30 text-teal-300 font-semibold
                               hover:bg-teal-400/10 transform hover:scale-105 transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>

            <!-- Right Column -->
            <div class="relative" @fadeSlideIn>
               <div class="relative bg-[#0c4a5c]/40 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                <img src="faucet.png" alt="Bitcoin Illustration" class="w-full animate-float">
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20 relative" @staggerFade>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl md:text-4xl font-bold text-center text-white mb-16">
            How It Works
          </h2>

          <div class="grid md:grid-cols-3 gap-8">
            <div *ngFor="let step of steps"
                 class="stagger-item group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10
                        hover:bg-white/10 transition-all duration-300">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-500
                            flex items-center justify-center text-white font-bold text-xl
                            group-hover:scale-110 transition-transform duration-300">
                  {{step.number}}
                </div>
                <div class="ml-4 h-px flex-1 bg-gradient-to-r from-teal-400/50 to-transparent"></div>
              </div>
              <h3 class="text-xl font-bold text-white mb-3">{{step.title}}</h3>
              <p class="text-gray-300">{{step.description}}</p>
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
      title: 'Enter Your Address',
      description: 'Provide your Bitcoin testnet wallet address in our secure form.'
    },
    {
      number: 2,
      title: 'Select Amount',
      description: 'Choose the amount of test Bitcoin you need (max 0.1 BTC per request).'
    },
    {
      number: 3,
      title: 'Instant Delivery',
      description: 'Receive your test Bitcoin within seconds, ready for development.'
    }
  ];

  ngOnInit() {
    // Component initialization
  }
}
