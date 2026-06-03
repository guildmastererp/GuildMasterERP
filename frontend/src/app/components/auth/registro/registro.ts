// #region IMPORTS
import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
// #endregion

@Component({
  selector: 'app-registro',
  templateUrl: './registro.html',
  styleUrls: ['./registro.css'],
  standalone: false
})
export class Registro {

  // #region PROPIEDADES
  email: string = '';
  pass: string = '';
  battletag: string = '';
  urlRaiderIo: string = '';

  nombreExtraido: string = '';
  reinoExtraido: string = '';

  errorUrl: boolean = false;
  cargando: boolean = false;
  errorBackend: string = '';
  // #endregion

  // #region CONSTRUCTOR
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef // <-- Herramienta para forzar el repintado de la pantalla
  ) {}
  // #endregion

  // #region MÉTODOS
  procesarUrl() {
    this.errorUrl = false;
    this.nombreExtraido = '';
    this.reinoExtraido = '';

    if (!this.urlRaiderIo) return;

    try {
      const url = new URL(this.urlRaiderIo);
      const partesRuta = url.pathname.split('/').filter(part => part.length > 0);
      const indexCharacters = partesRuta.indexOf('characters');
      
      if (indexCharacters !== -1 && partesRuta.length >= indexCharacters + 4) {
        this.reinoExtraido = partesRuta[indexCharacters + 2];
        this.nombreExtraido = partesRuta[indexCharacters + 3];
      } else {
        this.errorUrl = true;
      }
    } catch (error) {
      this.errorUrl = true;
    }
  }

  // Convertimos el método en asíncrono para usar fetch nativo
  async registrarUsuario() {
    if (this.errorUrl || !this.nombreExtraido) {
      this.errorBackend = 'Introduce un enlace de Raider.io válido primero.';
      return;
    }

    // Bloqueamos el botón y limpiamos alertas previas
    this.cargando = true;
    this.errorBackend = '';

    const datosRegistro = {
      name: this.nombreExtraido,
      email: this.email,
      password: this.pass,
      password_confirmation: this.pass,
      battletag: this.battletag,
      raiderio_url: this.urlRaiderIo
    };

    try {
      // API FETCH: Bypassea cualquier Interceptor de Angular que se esté tragando tus errores
      const response = await fetch('http://192.168.1.132:8000/api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(datosRegistro)
      });
      // ¡LIBERAMOS LOS BOTONES INMEDIATAMENTE!
      this.cargando = false;

      if (response.ok) {
        // Redirección si la cuenta se crea bien
        this.router.navigate(['/principal']);
      } else {
        // Si hay fallo, leemos el JSON manualmente
        const body = await response.json();

        // Evaluamos exactamente lo que devuelve Laravel
        if (response.status === 422 && body.errors) {
          if (body.errors.battletag) {
            this.errorBackend = 'El BattleTag ya tiene una cuenta asociada.';
          } else if (body.errors.email) {
            this.errorBackend = 'El correo electrónico ya está registrado.';
          } else {
            this.errorBackend = 'Revisa los datos introducidos.';
          }
        } else {
          this.errorBackend = body.message || 'Error desconocido del servidor.';
        }
      }
    } catch (error) {
      this.cargando = false;
      this.errorBackend = 'Error crítico de red. El servidor no responde.';
    }

    // ORDEN DIRECTA A ANGULAR: "He cambiado una variable, pinta la alerta roja AHORA MISMO"
    this.cdr.detectChanges();
  }

  volverAlLogin() {
    this.router.navigate(['/login']);
  }
  // #endregion
}