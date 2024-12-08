import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
