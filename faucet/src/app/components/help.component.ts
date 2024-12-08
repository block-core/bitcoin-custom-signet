import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-help',
  imports: [RouterModule],
  template: `
    <div class="help-container">
      <h2 class="section-title">Help & FAQs</h2>

      <!-- How to Use Section -->
      <div class="help-section">
        <h3>How to Use This Faucet?</h3>
        <ol>
          <li>Go to the <a [routerLink]="['/claim']">Claim</a> page.</li>
          <li>Enter your Bitcoin Testnet address.</li>
          <li>Specify the amount (up to <strong>0.001 BTC</strong>).</li>
          <li>Click the "Claim Bitcoin" button and wait for the transaction to complete.</li>
        </ol>
      </div>

      <!-- FAQ Section -->
      <div class="help-section">
        <h3>Frequently Asked Questions</h3>
        <div class="faq">
          <h4>What is Bitcoin Testnet?</h4>
          <p>Bitcoin Testnet is a parallel blockchain used for testing and experimentation. The coins on this network have no real-world value.</p>
        </div>

        <div class="faq">
          <h4>How do I get a Bitcoin Testnet wallet?</h4>
          <p>You can download Testnet-compatible wallets such as Electrum or Bitcoin Core. Make sure the wallet is configured to use Testnet.</p>
        </div>

        <div class="faq">
          <h4>Can I use Testnet Bitcoin on the Mainnet?</h4>
          <p>No, Testnet Bitcoins are only valid on the Testnet and cannot be used on the Bitcoin Mainnet.</p>
        </div>

        <div class="faq">
          <h4>Why is my transaction taking time?</h4>
          <p>Testnet transactions rely on Testnet miners. If there are fewer miners, transactions may take longer. This is normal for Testnet.</p>
        </div>

        <div class="faq">
          <h4>Is there a limit to how much I can claim?</h4>
          <p>Yes, the maximum amount per claim is <strong>0.001 BTC</strong> to ensure fair usage for everyone.</p>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="help-section">
        <h3>Need Further Assistance?</h3>
        <p>If you have additional questions or issues, feel free to reach out to us:</p>
        <ul>
          <li>Discord: <a href="https://www.blockcore.net/discord" target="_blank">Join our Discord</a></li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .help-container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 2rem;
      background-color: #f9f9f9;
      border: 1px solid #cbdde1;
      border-radius: 12px;
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    }

    .section-title {
      font-size: 2rem;
      color: #086c81;
      text-align: center;
      margin-bottom: 1.5rem;
      font-weight: bold;
    }

    .help-section {
      margin-bottom: 2rem;
    }

    .help-section h3 {
      font-size: 1.5rem;
      color: #086c81;
      margin-bottom: 1rem;
      font-weight: bold;
    }

    .help-section p, .help-section ol, .help-section ul {
      font-size: 1rem;
      line-height: 1.8;
      color: #022229;
    }

    .help-section ul {
      list-style: disc;
      margin-left: 1.5rem;
    }

    .help-section ol {
      list-style: decimal;
      margin-left: 1.5rem;
    }

    .help-section a {
      color: #086c81;
      text-decoration: none;
      font-weight: bold;
    }

    .help-section a:hover {
      text-decoration: underline;
    }

    .faq {
      margin-bottom: 1.5rem;
    }

    .faq h4 {
      font-size: 1.2rem;
      color: #022229;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .faq p {
      margin: 0;
    }
  `]
})
export class HelpComponent {
}
