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
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-3xl mx-auto px-4">
        <!-- Header Section -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Bitcoin Testnet Faucet
          </h1>
          <p class="mt-4 text-xl text-gray-500">
          Get test bitcoins instantly for development purposes
          </p>
        </div>
        <!-- Main Form Card -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <form (ngSubmit)="submitClaim()" #claimForm="ngForm" class="space-y-8">
            <!-- Bitcoin Address Field -->
            <div>
              <label for="address" class="block text-sm font-semibold text-gray-700 mb-2">
                Bitcoin Address
              </label>
              <div class="relative">
                <input
                  type="text"
                  id="address"
                  name="address"
                  [(ngModel)]="address"
                  #addressInput="ngModel"
                  (blur)="addressTouched.set(true)"
                  [class]="'w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ' +
                          (addressInput.invalid && shouldShowError(addressTouched())
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 focus:border-[#086c81] focus:ring-2 focus:ring-blue-200')"
                  placeholder="Enter your Bitcoin testnet address"
                  required
                  [disabled]="isSubmitting()"
                />
                <div *ngIf="addressInput.invalid && shouldShowError(addressTouched())"
                     class="text-red-500 text-sm mt-1 animate-fade-in">
                  Please enter a valid Bitcoin address
                </div>
              </div>
            </div>

            <!-- Amount Selection -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                Select Amount (BTC)
              </label>
              <div class="grid grid-cols-3 gap-4 mb-4">
                <button type="button"
                        *ngFor="let amt of [0.001, 0.01, 0.1]"
                        (click)="setAmount(amt)"
                        [class]="'py-3 px-4 rounded-lg text-center transition-all duration-200 ' +
                                (amount() === amt
                                  ? 'bg-[#086c81] text-white shadow-lg'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800')">
                  {{amt}} BTC
                </button>
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                [(ngModel)]="amount"
                #amountInput="ngModel"
                (blur)="amountTouched.set(true)"
                class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Or enter custom amount"
                min="0.00001"
                max="0.1"
                step="0.00001"
                required
                [disabled]="isSubmitting()"
              />
            </div>

            <!-- CAPTCHA Section -->
            <div class="bg-gray-50 p-6 rounded-lg">
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                Verify you're human
              </label>
              <div class="flex items-center space-x-4">
                <div class="bg-white p-3 rounded-lg shadow text-lg font-medium">
                  {{captchaQuestion}}
                </div>
                <input
                  type="text"
                  id="captcha"
                  name="captcha"
                  [(ngModel)]="captchaAnswer"
                  #captchaInput="ngModel"
                  class="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#086c81] focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter the answer"
                  required
                  [disabled]="isSubmitting()"
                />
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit"
                    [disabled]="isSubmitting() || claimForm.invalid"
                    class="w-full py-4 px-6 text-lg font-semibold text-white bg-[#086c81] rounded-lg
                           hover:bg-[#086c81] transition-colors duration-200
                           disabled:bg-gray-400 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-4 focus:ring-blue-200">
              {{ isSubmitting() ? 'Processing...' : 'Claim Testnet Bitcoin' }}
            </button>
          </form>

          <!-- Response Messages -->
          <div *ngIf="submissionStatus()"
               [@fadeInOut]
               [class]="'mt-6 p-6 rounded-lg ' +
                        (submissionStatus()?.type === 'success'
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-red-50 border-2 border-red-200')">
            <div class="flex items-start">
              <div [class]="'p-2 rounded-full ' +
                           (submissionStatus()?.type === 'success' ? 'bg-green-100' : 'bg-red-100')">
                <svg *ngIf="submissionStatus()?.type === 'success'"
                     class="w-6 h-6 text-green-600"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7" />
                </svg>
                <svg *ngIf="submissionStatus()?.type === 'error'"
                     class="w-6 h-6 text-red-600"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 [class]="'text-lg font-medium ' +
                            (submissionStatus()?.type === 'success'
                              ? 'text-green-800'
                              : 'text-red-800')">
                  {{submissionStatus()?.type === 'success' ? 'Success!' : 'Error'}}
                </h3>
                <p class="mt-2 text-sm text-gray-600">{{submissionStatus()?.message}}</p>
                <p *ngIf="submissionStatus()?.transactionId"
                   class="mt-2 text-sm text-gray-600">
                  <span class="font-medium">Transaction ID:</span>
                  <code class="ml-2 p-1 bg-gray-100 rounded">{{submissionStatus()?.transactionId}}</code>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Section -->
        <div class="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4">About This Faucet</h3>
          <div class="prose prose-blue">
            <ul class="space-y-2 text-gray-600">
              <li>This faucet provides testnet bitcoins for development purposes</li>
              <li>Maximum claim: <strong>0.1 BTC</strong> per transaction</li>
              <li>Minimum claim: <strong>0.00001 BTC</strong></li>
              <li>Please use responsibly to ensure availability for everyone</li>
            </ul>
          </div>
        </div>
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
