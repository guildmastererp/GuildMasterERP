import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: false
})
export class Login {
  email: string = '';
  pass: string = '';
  
  cargando: boolean = false;
  errorBackend: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  iniciarSesion() {
    this.cargando = true;
    this.errorBackend = '';

    const credenciales = {
      correo: this.email,
      contrasenya: this.pass
    };

this.authService.login(credenciales).subscribe({
      next: (res: any) => {
        this.cargando = false;
        // Ahora entra a la vista principal para ver el logo
        this.router.navigate(['/principal']); 
      },
      error: (err: any) => {
        this.cargando = false;
        // Mostramos el mensaje exacto que devuelve Laravel (ej. "Credenciales incorrectas")
        this.errorBackend = err.error?.message || 'Error al conectar con el servidor';
      }
    });
  }

  abrirRegistro() {
    this.router.navigate(['/registro']);
  }
}