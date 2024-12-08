import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <p>&copy; 2024 Bitcoin Faucet | <a href="#">Privacy Policy</a></p>
    </footer>
  `,
  styles: [`
    .footer {
      /* Add your styles here */
    }
  `]
})
export class FooterComponent {

}
