import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-claim',
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './claim.component.html',
  styleUrl: './claim.component.scss'
})
export class ClaimComponent {
  address: string = '';
  amount: number | null = null;

  submitClaim() {
    if (!this.address || !this.amount) {
      console.error('Invalid input');
      return;
    }

    if (this.amount > 0.001) {
      console.error('Amount exceeds the maximum limit of 0.001 BTC');
      return;
    }

    console.log('Claim submitted:', {
      address: this.address,
      amount: this.amount,
    });

    // Add logic to send this data to the backend (e.g., via HTTP)
  }
}
