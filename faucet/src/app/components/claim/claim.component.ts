import { Component, Signal, computed, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
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
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.scss']
})
export class ClaimComponent {
  address = signal<string>('');
  amount = signal<number | null>(null);
  isSubmitting = signal<boolean>(false);
  submissionStatus = signal<{ message: string; type: 'success' | 'error'; transactionId?: string } | null>(null);

  // Control when error messages are displayed
  showErrors = signal<boolean>(true);

  // Validation Signals
  isAddressValid: Signal<boolean> = computed(() => !!this.address());
  isAmountValid: Signal<boolean> = computed(() => this.amount() !== null && this.amount()! > 0 && this.amount()! <= 0.001);

  constructor(private apiService: ApiService) {}

  submitClaim(): void {
    this.showErrors.set(false);
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
  }
}
