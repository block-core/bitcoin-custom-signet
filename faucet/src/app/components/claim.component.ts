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
    <div class="claim-container">
      <h2 class="section-title">Claim Your Bitcoin</h2>

      <form (ngSubmit)="submitClaim()" #claimForm="ngForm" class="claim-form">
        <!-- Bitcoin Address Input -->
        <div class="form-group">
          <label for="address">Bitcoin Address</label>
          <input
            type="text"
            id="address"
            name="address"
            [(ngModel)]="address"
            #addressInput="ngModel"
            (blur)="addressTouched.set(true)"
            [class.invalid]="addressInput.invalid && shouldShowError(addressTouched())"
            placeholder="Enter your Bitcoin address"
            required
            class="form-control"
            [disabled]="isSubmitting()"
          />
          <div *ngIf="addressInput.invalid && shouldShowError(addressTouched())" class="error">
            Bitcoin address is required.
          </div>
        </div>

        <!-- Preset Amount Buttons -->
        <div class="preset-buttons">
          <button type="button" (click)="setAmount(0.001)" class="preset-button">0.001 BTC</button>
          <button type="button" (click)="setAmount(0.01)" class="preset-button">0.01 BTC</button>
          <button type="button" (click)="setAmount(0.1)" class="preset-button">0.1 BTC</button>
        </div>

        <!-- Amount Input -->
        <div class="form-group">
          <label for="amount">Amount (max: 0.1 BTC)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            [(ngModel)]="amount"
            #amountInput="ngModel"
            (blur)="amountTouched.set(true)"
            [class.invalid]="amountInput.invalid && shouldShowError(amountTouched())"
            placeholder="Enter amount (e.g., 0.1)"
            min="0.00001"
            max="0.1"
            step="0.00001"
            required
            class="form-control"
            [disabled]="isSubmitting()"
          />
          <div *ngIf="amountInput.invalid && shouldShowError(amountTouched())" class="error">
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
            class="form-control"
            [disabled]="isSubmitting()"
          />
          <div *ngIf="captchaInput.invalid && shouldShowError(captchaTouched())" class="error">
            CAPTCHA answer is required.
          </div>
          <div *ngIf="captchaError()" class="error">
            Incorrect CAPTCHA answer. Please try again.
          </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" [disabled]="isSubmitting() || claimForm.invalid" class="submit-button">
          <ng-container *ngIf="isSubmitting(); else submitText">Submitting...</ng-container>
          <ng-template #submitText>Claim Bitcoin</ng-template>
        </button>
      </form>

      <!-- Response Message -->
      <div *ngIf="submissionStatus()" class="response-message" [ngClass]="submissionStatus()?.type">
        <div *ngIf="submissionStatus()?.type === 'success'">
          <h3>{{ submissionStatus()?.message }}</h3>
          <p><strong>Transaction ID:</strong> {{ submissionStatus()?.transactionId }}</p>
        </div>
        <div *ngIf="submissionStatus()?.type === 'error'">
          <p>{{ submissionStatus()?.message }}</p>
        </div>
      </div>

      <!-- Description Box -->
      <div class="description-box">
        <h3>About This Faucet</h3>
        <p>
          This faucet is designed to provide small amounts of Testnet Bitcoins to users for their experiments. The maximum claim per transaction is <strong>0.1 BTC</strong>. Abuse of this service may result in restrictions to ensure fair usage.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .claim-container {
      background-color: #f9f9f9;
      padding: 2rem;
      border-radius: 8px;
      max-width: 600px;
      margin: 2rem auto;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    }

    .section-title {
      text-align: center;
      color: #086c81;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .claim-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
       }

      label {
        font-weight: bold;
        color: #022229;
      }

      .form-control {
        padding: 0.75rem;
        border: 1px solid #cbdde1;
        border-radius: 8px;
        font-size: 1rem;
      }

      .form-control:focus {
        outline: none;
        border-color: #086c81;
        box-shadow: 0 0 4px #086c81;
      }

      .error {
        font-size: 0.875rem;
        color: #ff0000;
      }

      .submit-button {
        background-color: #086c81;
        color: #ffffff;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:disabled {
          background-color: #cbdde1;
          cursor: not-allowed;
        }

        &:hover:not(:disabled) {
          background-color: #0a758c;
        }
      }
    }

    .preset-buttons {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .preset-button {
      background-color: #086c81;
      color: #ffffff;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .preset-button:hover {
      background-color: #0a758c;
    }

    .response-message {
      margin-top: 20px;
      padding: 20px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: bold;
      text-align: center;
      word-wrap: break-word; /* Ensure text wraps within the container */
    }

    .response-message.success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .response-message.error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .description-box {
      margin-top: 2rem;
      padding: 1rem;
      background-color: #ffffff;
      border: 1px solid #cbdde1;
      border-radius: 8px;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
      .claim-container {
        padding: 1rem;
      }

      .claim-form {
        gap: 1rem;
        padding: 0 0.5rem; /* Adjust padding for smaller screens */
      }

      .form-group {
        padding: 0 0.5rem; /* Ensure equal padding on both sides for smaller screens */
      }

      .preset-buttons {
        flex-direction: column;
        gap: 0.5rem;
      }

      .response-message {
        font-size: 0.875rem;
        padding: 15px;
        word-wrap: break-word; /* Ensure text wraps within the container */
      }

      .description-box {
        padding: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .claim-container {
        padding: 1rem;
        margin: 1rem;
      }

      .claim-form {
        gap: 0.75rem;
        padding: 0 0.25rem; /* Adjust padding for smaller screens */
      }

      .form-group {
        padding: 0 0.25rem; /* Ensure equal padding on both sides for smaller screens */
      }

      .preset-buttons {
        flex-direction: column;
        gap: 0.5rem;
      }

      .response-message {
        font-size: 0.75rem;
        padding: 10px;
        word-wrap: break-word; /* Ensure text wraps within the container */
      }

      .description-box {
        padding: 0.5rem;
      }
    }
  `]
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
