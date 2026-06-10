// #region IMPORTS
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
// #endregion

/**
 * Guarda de ruta que protege el acceso al área privada del ERP.
 * Compatible con Server-Side Rendering (SSR) en Angular 17+.
 *
 * @returns {boolean} true si hay sesión o estamos en el servidor; false si redirige al login en el cliente.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID); // Identifica si estamos en el servidor o en el navegador

  // 1. COMPROBACIÓN EN EL NAVEGADOR (CLIENTE)
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');

    // Validación estricta del token
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      return true; // Token válido, puedes pasar
    }

    // No hay token o está corrupto: expulsión al login
    router.navigate(['/login']);
    return false;
  }

  // 2. COMPROBACIÓN EN EL SERVIDOR (SSR / F5)
  // Como el servidor no puede leer el localStorage, le decimos que devuelva 'true' 
  // para no bloquear la recarga. El navegador tomará el control al instante y aplicará la seguridad.
  return true;
};