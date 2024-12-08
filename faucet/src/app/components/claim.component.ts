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
    
        <!-- Amount Input -->
        <div class="form-group">
          <label for="amount">Amount (max: 0.001 BTC)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            [(ngModel)]="amount"
            #amountInput="ngModel"
            (blur)="amountTouched.set(true)"
            [class.invalid]="amountInput.invalid && shouldShowError(amountTouched())"
            placeholder="Enter amount (e.g., 0.001)"
            min="0.00001"
            max="0.001"
            step="0.00001"
            required
            class="form-control"
            [disabled]="isSubmitting()"
          />
          <div *ngIf="amountInput.invalid && shouldShowError(amountTouched())" class="error">
            Please enter a valid amount between 0.00001 and 0.001 BTC.
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
  `]
})
export class ClaimComponent {
  address = signal<string>('');
  amount = signal<number | null>(null);
  isSubmitting = signal<boolean>(false);
  submissionStatus = signal<{ message: string; type: 'success' | 'error'; transactionId?: string } | null>(null);

  // Track touched state for each field
  addressTouched = signal<boolean>(false);
  amountTouched = signal<boolean>(false);
  formSubmitted = signal<boolean>(false);

  // Control when error messages are displayed
  showErrors = signal<boolean>(true);

  // Validation Signals
  isAddressValid: Signal<boolean> = computed(() => !!this.address());
  isAmountValid: Signal<boolean> = computed(() => this.amount() !== null && this.amount()! > 0 && this.amount()! <= 0.001);

  constructor(private apiService: ApiService) {}

  shouldShowError(fieldTouched: boolean): boolean {
    return fieldTouched || this.formSubmitted();
  }

  submitClaim(): void {
    this.formSubmitted.set(true);
    this.submissionStatus.set(null);

    if (!this.isAddressValid() || !this.isAmountValid()) {
      this.submissionStatus.set({
        message: 'Invalid address or amount. Please check your input.',
        type: 'error'
      });
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
    this.addressTouched.set(false);
    this.amountTouched.set(false);
    this.formSubmitted.set(false);
  }
}
