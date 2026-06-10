// #region IMPORTS
import { Injectable } from '@angular/core';
// #endregion

@Injectable({
  providedIn: 'root'
})
export class UiService {

  // #region PROPIEDADES DE ESTADO
  /** Indica si la modal de registro debe estar visible o no. */
  showRegisterModal: boolean = false;
  // #endregion

  // #region MÉTODOS DE CONTROL
  /**
   * Abre la modal de registro cambiando su estado a true.
   * * @returns {void}
   */
  openRegisterModal(): void {
    this.showRegisterModal = true;
  }

  /**
   * Cierra la modal de registro cambiando su estado a false.
   * * @returns {void}
   */
  closeRegisterModal(): void {
    this.showRegisterModal = false;
  }
  // #endregion
}