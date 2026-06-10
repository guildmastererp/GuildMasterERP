// #region IMPORTS
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
// #endregion

/**
 * Guarda de ruta que protege el acceso al área privada del ERP.
 * Comprueba la existencia del token de sesión en el LocalStorage.
 * Si no hay token, cancela la navegación y redirige al login,
 * impidiendo el acceso directo por URL a rutas como /principal/raid/loot.
 *
 * @returns {boolean} true si hay sesión activa; false si redirige al login.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};