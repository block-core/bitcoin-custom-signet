import { Component, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  template: `
    <div class="home-container">
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-text animate-in">
            <h1 class="title animate-item">Welcome to Bitcoin Faucet</h1>
            <p class="subtitle animate-item">Claim free Bitcoin instantly with your Testnet wallet address. Simple and secure!</p>
            <button class="cta-button animate-item" aria-label="Get Bitcoin Now" [routerLink]="['/claim']">Get Bitcoin Now</button>
          </div>
          <img src="faucet.png" alt="Illustration of Bitcoin Faucet" class="hero-image animate-in" />
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="steps-section" aria-labelledby="how-it-works-title">
        <h2 class="section-title" id="how-it-works-title">How It Works</h2>
        <div class="steps">
          <article class="step" #stepElement>
            <div class="step-icon" aria-hidden="true">1</div>
            <h3>Enter Your Wallet Address</h3>
            <p>Provide your Testnet Bitcoin address to receive rewards.</p>
          </article>
          <article class="step" #stepElement>
            <div class="step-icon" aria-hidden="true">2</div>
            <h3>Enter the Amount</h3>
            <p>Specify the amount (less than 50 BTC test).</p>
          </article>
          <article class="step" #stepElement>
            <div class="step-icon" aria-hidden="true">3</div>
            <h3>Claim Your Bitcoin</h3>
            <p>Submit your request and get your free Bitcoin instantly! (1 request per IP per 24 hours)</p>
          </article>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      width: 100%;
    }

    .hero-section {
      padding: 2rem 2rem;  /* reduced from 4rem */
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero-content {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .hero-text {
      flex: 1;
    }

    .hero-image {
      flex: 1;
      max-width: 400px;  /* reduced from 500px */
    }

    .animate-in {
      opacity: 0;
      transform: translateY(20px);
      animation: fadeInUp 0.8s ease-out forwards;
    }

    .animate-item {
      opacity: 0;
      transform: translateY(20px);
    }

    .hero-text .animate-item:nth-child(1) {
      animation: fadeInUp 0.8s ease-out 0.2s forwards;
    }

    .hero-text .animate-item:nth-child(2) {
      animation: fadeInUp 0.8s ease-out 0.4s forwards;
    }

    .hero-text .animate-item:nth-child(3) {
      animation: fadeInUp 0.8s ease-out 0.6s forwards;
    }

    .hero-image {
      animation: fadeInUp 0.8s ease-out 0.8s forwards;
    }

    .step {
      transition: box-shadow 0.2s ease;  /* faster transition, was likely 0.3s or higher */
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class HomeComponent implements AfterViewInit {
  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.step').forEach((step) => {
      observer.observe(step);
    });
  }
}
