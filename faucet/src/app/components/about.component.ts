import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  imports: [],
  template: `
    <div class="about-container">
      <h2 class="section-title">About Bitcoin Testnet</h2>
      <div class="info-box">
        <p>
          The Bitcoin Testnet is a parallel blockchain to the Bitcoin Mainnet, designed specifically for developers, testers, and enthusiasts. It allows users to experiment with Bitcoin features, test applications, and learn about cryptocurrency transactions without the risk of losing real Bitcoins or affecting the Bitcoin network.
        </p>

        <h3>Why Use the Bitcoin Testnet?</h3>
        <ul>
          <li><strong>Risk-Free Testing:</strong> Testnet Bitcoins have no monetary value, making it safe to experiment without financial risk.</li>
          <li><strong>Learn Bitcoin Basics:</strong> New users can practice sending and receiving transactions without the pressure of real money.</li>
          <li><strong>Application Development:</strong> Developers can test their wallets, apps, or smart contracts in a real-world environment.</li>
          <li><strong>Network Simulation:</strong> The Testnet replicates the Bitcoin network's functionality, including mining, transactions, and blocks.</li>
        </ul>

        <h3>How Does It Work?</h3>
        <p>
          The Bitcoin Testnet operates similarly to the Mainnet but with key differences:
        </p>
        <ul>
          <li><strong>Separate Blockchain:</strong> Testnet has its own blockchain, distinct from Bitcoin's Mainnet.</li>
          <li><strong>No Monetary Value:</strong> Testnet Bitcoins are intentionally made worthless to prevent misuse.</li>
          <li><strong>Easy Access:</strong> Testnet Bitcoins can be obtained freely from faucets, like this one.</li>
          <li><strong>Reset Mechanism:</strong> Periodically, the Testnet resets to clear old data and maintain its testing focus.</li>
        </ul>

        <h3>Important Notes</h3>
        <p>
          Testnet is for testing and development purposes only. It is not meant for real-world transactions. Always ensure you're using the correct network (Testnet vs. Mainnet) before initiating any transaction. Misuse of the Testnet for malicious activities can lead to restrictions.
        </p>

        <h3>About This Faucet</h3>
        <p>
          This faucet is designed to provide small amounts of Testnet Bitcoins to users for their experiments. The maximum claim per transaction is <strong>0.001 BTC</strong>. Abuse of this service may result in restrictions to ensure fair usage.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .about-container {
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

    .info-box {
      line-height: 1.8;
      font-size: 1rem;
      color: #022229;
    }

    .info-box p {
      margin-bottom: 1.5rem;
    }

    .info-box h3 {
      font-size: 1.2rem;
      color: #086c81;
      margin-top: 1.5rem;
      margin-bottom: 1rem;
    }

    .info-box ul {
      list-style: disc;
      margin-left: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .info-box ul li {
      margin-bottom: 0.5rem;
    }

    .info-box ul li strong {
      color: #086c81;
    }
  `]
})
export class AboutComponent {
}
