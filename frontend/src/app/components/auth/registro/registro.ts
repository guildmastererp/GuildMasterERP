import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.html',
  styleUrls: ['./registro.css'],
  standalone: false
})
export class Registro {
  // Campos del formulario
  email: string = '';
  pass: string = '';
  battletag: string = '';
  urlRaiderIo: string = '';

  // Variables extraídas automáticamente
  nombreExtraido: string = '';
  reinoExtraido: string = '';

  // Control de estado y errores
  errorUrl: boolean = false;
  cargando: boolean = false;
  errorBackend: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Se ejecuta al quitar el foco del input de Raider.io
  procesarUrl() {
    this.errorUrl = false;
    this.nombreExtraido = '';
    this.reinoExtraido = '';

    if (!this.urlRaiderIo) {
      return;
    }

    try {
      // Ejemplo esperado: https://raider.io/characters/eu/sanguino/TuPersonaje
      const url = new URL(this.urlRaiderIo);
      const partesRuta = url.pathname.split('/').filter(part => part.length > 0);

      // Verificamos que tenga la estructura correcta: ['characters', 'region', 'reino', 'nombre']
      const indexCharacters = partesRuta.indexOf('characters');
      
      if (indexCharacters !== -1 && partesRuta.length >= indexCharacters + 4) {
        this.reinoExtraido = partesRuta[indexCharacters + 2];
        this.nombreExtraido = partesRuta[indexCharacters + 3];
      } else {
        this.errorUrl = true;
      }
    } catch (error) {
      // Si la URL no tiene formato válido (ej. falta el https://)
      this.errorUrl = true;
    }
  }

  registrarUsuario() {
    // Evitamos enviar si hay errores en la URL o faltan datos clave
    if (this.errorUrl || !this.nombreExtraido) {
      this.errorBackend = 'Por favor, introduce un enlace de Raider.io válido primero.';
      return;
    }

    this.cargando = true;
    this.errorBackend = '';

    // Mapeamos los datos para que coincidan con las validaciones de tu AuthController en Laravel
    const datosRegistro = {
      correo: this.email,
      contrasenya: this.pass,
      nombre: this.nombreExtraido, // Usamos el nombre del Main como nombre de usuario base
      battletag: this.battletag,
      nombreMain: this.nombreExtraido
    };

    this.authService.registrarUsuario(datosRegistro).subscribe({
      next: (res: any) => {
        this.cargando = false;
        // Si se crea la cuenta con éxito, entramos directamente al ERP
        this.router.navigate(['/comunidad/perfil']);
      },
      error: (err: any) => {
        this.cargando = false;
        // Si el correo ya existe, Laravel devolverá un error de validación (422)
        if (err.status === 422) {
          this.errorBackend = 'Ese correo o BattleTag ya está en uso. Revisa los datos.';
        } else {
          this.errorBackend = err.error?.message || 'Error al intentar registrar el usuario';
        }
      }
    });
  }

  volverAlLogin() {
    // Devuelve al usuario a la pantalla principal de login
    this.router.navigate(['/autentificacion']);
  }
}