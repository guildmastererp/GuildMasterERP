import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  mensaje: string;
  tipo: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new Subject<Toast>();
  toasts$ = this.toastsSubject.asObservable();
  private contador = 0;

  showSuccess(mensaje: string) {
    this.toastsSubject.next({ id: this.contador++, mensaje, tipo: 'success' });
  }

  showError(mensaje: string) {
    this.toastsSubject.next({ id: this.contador++, mensaje, tipo: 'error' });
  }
}