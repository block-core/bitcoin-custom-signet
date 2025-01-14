import { Component, Signal, computed, signal } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ClaimResponse {
  transactionId: string;
}

@Component({
  selector: 'app-claim',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-8">Claim Your Bitcoin</h2>

      <form (ngSubmit)="submitClaim()" #claimForm="ngForm" class="bg-white shadow-lg rounded-lg p-6 space-y-6">
        <!-- Bitcoin Address Input -->
        <div class="space-y-2">
          <label for="address" class="block text-sm font-medium text-gray-700">Bitcoin Address</label>
          <input
            type="text"
            id="address"
            name="address"
            [(ngModel)]="address"
            #addressInput="ngModel"
            (blur)="addressTouched.set(true)"
            [class]="'w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-primary ' +
                    (addressInput.invalid && shouldShowError(addressTouched()) ? 'border-red-500 bg-red-50' : 'border-gray-300')"
            placeholder="Enter your Bitcoin address"
            required
            [disabled]="isSubmitting()"
          />
          <div *ngIf="addressInput.invalid && shouldShowError(addressTouched())"
               class="text-sm text-red-600">
            Bitcoin address is required.
          </div>
        </div>

        <!-- Preset Amount Buttons -->
        <div class="grid grid-cols-3 gap-3">
          <button type="button"
                  *ngFor="let amount of [0.001, 0.01, 0.1]"
                  (click)="setAmount(amount)"
                  class="px-4 py-2 text-sm font-medium text-primary bg-primary-light rounded-md hover:bg-primary hover:text-white transition-colors">
            {{amount}} BTC
          </button>
        </div>

        <!-- Amount Input -->
        <div class="space-y-2">
          <label for="amount" class="block text-sm font-medium text-gray-700">Amount (max: 0.1 BTC)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            [(ngModel)]="amount"
            #amountInput="ngModel"
            (blur)="amountTouched.set(true)"
            [class]="'w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-primary ' +
                    (amountInput.invalid && shouldShowError(amountTouched()) ? 'border-red-500 bg-red-50' : 'border-gray-300')"
            placeholder="Enter amount (e.g., 0.1)"
            min="0.00001"
            max="0.1"
            step="0.00001"
            required
            [disabled]="isSubmitting()"
          />
          <div *ngIf="amountInput.invalid && shouldShowError(amountTouched())"
               class="text-sm text-red-600">
            Please enter a valid amount between 0.00001 and 0.1 BTC.
          </div>
        </div>

        <!-- CAPTCHA -->
        <div class="form-group">
          <label for="captcha">CAPTCHA: {{ captchaQuestion }}</label>
          <input
            type="text"
            id="captcha"
            name="captcha"
            [(ngModel)]="captchaAnswer"
            #captchaInput="ngModel"
            (blur)="captchaTouched.set(true)"
            [class.invalid]="captchaInput.invalid && shouldShowError(captchaTouched())"
            placeholder="Enter the answer"
            required
            [class]="'w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-primary ' +
                    (amountInput.invalid && shouldShowError(amountTouched()) ? 'border-red-500 bg-red-50' : 'border-gray-300')"            [disabled]="isSubmitting()"
          />
          <div *ngIf="captchaInput.invalid && shouldShowError(captchaTouched())" class="text-sm text-red-600">
            CAPTCHA answer is required.
          </div>
          <div *ngIf="captchaError()" class="text-sm text-red-600">
            Incorrect CAPTCHA answer. Please try again.
          </div>
        </div>

        <!-- Submit Button -->
        <button type="submit"
                [disabled]="isSubmitting() || claimForm.invalid"
                class="w-full py-3 px-4 text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
          {{ isSubmitting() ? 'Submitting...' : 'Claim Bitcoin' }}
        </button>
      </form>

      <!-- Response Messages -->
      <div *ngIf="submissionStatus()"
           [class]="'mt-6 p-4 rounded-lg text-center ' +
           (submissionStatus()?.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')">
        <p class="font-medium">{{ submissionStatus()?.message }}</p>
        <p *ngIf="submissionStatus()?.transactionId" class="mt-2 text-sm">
          <strong>Transaction ID:</strong> {{ submissionStatus()?.transactionId }}
        </p>
      </div>

      <!-- Description Box -->
      <div class="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">About This Faucet</h3>
        <p class="text-gray-600">
          This faucet is designed to provide small amounts of Testnet Bitcoins for testing purposes.
          The maximum claim per transaction is <strong>0.1 BTC</strong>.
          Please use responsibly to ensure fair access for everyone.
        </p>
      </div>
    </div>
  `
})
export class ClaimComponent {
  address = signal<string>('');
  amount = signal<number | null>(null);
  isSubmitting = signal<boolean>(false);
  submissionStatus = signal<{ message: string; type: 'success' | 'error'; transactionId?: string } | null>(null);
  captchaAnswer = signal<string>('');
  captchaTouched = signal<boolean>(false);
  captchaError = signal<boolean>(false);
  captchaQuestion = this.generateCaptchaQuestion();

  // Track touched state for each field
  addressTouched = signal<boolean>(false);
  amountTouched = signal<boolean>(false);
  formSubmitted = signal<boolean>(false);

  // Control when error messages are displayed
  showErrors = signal<boolean>(true);

  // Validation Signals
  isAddressValid: Signal<boolean> = computed(() => !!this.address());
  isAmountValid: Signal<boolean> = computed(() => this.amount() !== null && this.amount()! > 0 && this.amount()! <= 0.1);
  isCaptchaValid: Signal<boolean> = computed(() => this.captchaAnswer() === this.solveCaptchaQuestion() && this.formSubmitted());

  constructor(private apiService: ApiService) {}

  shouldShowError(fieldTouched: boolean): boolean {
    return fieldTouched || this.formSubmitted();
  }

  generateCaptchaQuestion(): string {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    return `${num1} + ${num2}`;
  }

  solveCaptchaQuestion(): string {
    const [num1, num2] = this.captchaQuestion.split(' + ').map(Number);
    return (num1 + num2).toString();
  }

  submitClaim(): void {
    this.formSubmitted.set(true);
    this.submissionStatus.set(null);

    if (!this.isAddressValid() || !this.isAmountValid() || !this.isCaptchaValid()) {
      this.submissionStatus.set({
        message: 'Invalid address, amount, or CAPTCHA. Please check your input.',
        type: 'error'
      });
      this.captchaError.set(true);
      return;
    }

    this.isSubmitting.set(true);

    const claimData = {
      toAddress: this.address(),
      amount: this.amount()!
    };

    this.apiService.post<ClaimResponse>('Faucet/send', claimData).subscribe({
      next: (response) => {
        this.submissionStatus.set({
          message: 'Your request was successful!',
          type: 'success',
          transactionId: response.transactionId
        });
        this.resetForm();
      },
      error: (error) => {
        this.submissionStatus.set({
          message: error.message || 'An error occurred while submitting the claim.',
          type: 'error'
        });
      },
      complete: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  private resetForm(): void {
    this.address.set('');
    this.amount.set(null);
    this.captchaAnswer.set('');
    this.captchaQuestion = this.generateCaptchaQuestion();
    this.addressTouched.set(false);
    this.amountTouched.set(false);
    this.captchaTouched.set(false);
    this.formSubmitted.set(false);

    this.captchaError.set(false);
  }

  setAmount(amount: number): void {
    this.amount.set(amount);
  }
}
