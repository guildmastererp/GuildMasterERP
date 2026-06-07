// #region IMPORTS
import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Asegúrate de tenerlo por consistencia
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
    private cdr: ChangeDetectorRef
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

  async registrarUsuario() {
    if (this.errorUrl || !this.nombreExtraido) {
      this.errorBackend = 'Introduce un enlace de Raider.io válido primero.';
      return;
    }

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
      const response = await fetch('http://192.168.1.130:8000/api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(datosRegistro)
      });
      
      this.cargando = false;

      if (response.ok) {
        // CORRECCIÓN: Redirección al Login tras registro exitoso
        alert('Cuenta creada con éxito. Redirigiendo a inicio de sesión...');
        this.router.navigate(['/login']);
      } else {
        const body = await response.json();

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

    this.cdr.detectChanges();
  }

  volverAlLogin() {
    this.router.navigate(['/login']);
  }
  // #endregion
}