// #region IMPORTS
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
// #endregion

/**
 * Estructura de un mensaje de notificación emergente (Toast).
 */
export interface Toast {
  id: number;
  tipo: 'success' | 'error';
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  // #region PROPIEDADES
  /** Emisor interno de notificaciones. */
  private toastsSubject = new Subject<Toast>();

  /** Flujo observable al que se suscribe el Layout para mostrar los toasts. */
  public toasts$: Observable<Toast> = this.toastsSubject.asObservable();

  /** Contador para generar identificadores únicos. */
  private contador: number = 0;
  // #endregion

  // #region MÉTODOS PÚBLICOS
  /**
   * Emite una notificación de éxito.
   * @param mensaje - Texto a mostrar.
   * @returns {void}
   */
  showSuccess(mensaje: string): void {
    this.emitir('success', mensaje);
  }

  /**
   * Emite una notificación de error.
   * @param mensaje - Texto a mostrar.
   * @returns {void}
   */
  showError(mensaje: string): void {
    this.emitir('error', mensaje);
  }
  // #endregion

  // #region MÉTODOS PRIVADOS
  /**
   * Construye y emite el toast por el Subject.
   * @private
   * @param tipo - Tipo de notificación.
   * @param mensaje - Texto a mostrar.
   * @returns {void}
   */
  private emitir(tipo: 'success' | 'error', mensaje: string): void {
    this.contador++;
    this.toastsSubject.next({ id: this.contador, tipo, mensaje });
  }
  // #endregion
}