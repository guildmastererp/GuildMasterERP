// #region IMPORTS
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// #endregion

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'], 
  standalone: false
})
export class Login {

  // #region PROPIEDADES
  email: string = '';
  pass: string = '';
  cargando: boolean = false;
  errorBackend: string = '';
  // #endregion

  // #region CONSTRUCTOR
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
  // #endregion

  // #region MÉTODOS

  /**
   * Procesa la solicitud de inicio de sesión del usuario.
   * Valida localmente que los campos no estén vacíos antes de enviar la petición.
   * Gestiona el estado de carga y, en caso de recibir una respuesta exitosa del servidor,
   * almacena el token de acceso en el LocalStorage para autenticar futuras llamadas API,
   * redirigiendo finalmente a la ventana principal del ERP.
   * * @returns {void}
   */
  iniciarSesion(): void {
    // 1. Freno si los campos están vacíos (evita enviar peticiones en blanco)
    if (!this.email || !this.pass) {
      this.errorBackend = 'Por favor, rellena tu correo y contraseña.';
      return;
    }

    this.cargando = true;
    this.errorBackend = '';

    const datosLogin = {
      email: this.email,
      password: this.pass
    };

    // 2. Forzamos las cabeceras para que Laravel reconozca el JSON
    const opciones = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };

    // 3. Petición POST a la IP de tu Máquina Virtual
    this.http.post('http://192.168.1.130:8000/api/login', datosLogin, opciones).subscribe({
      next: (res: any) => {
        this.cargando = false;
        
        // ¡PASO CRÍTICO!: Guardamos el Token para que el Perfil pueda usarlo luego
        if (res.access_token) {
          localStorage.setItem('token', res.access_token);
        }

        // Redirigimos al sistema ERP
        this.router.navigate(['/principal']);
      },
      error: (err: any) => {
        this.cargando = false;
        
        // Analizamos los posibles rechazos
        if (err.status === 401) {
          this.errorBackend = 'El correo o la contraseña son incorrectos.';
        } else if (err.status === 422) {
          this.errorBackend = 'Faltan datos por enviar o tienen un formato inválido.';
        } else {
          this.errorBackend = 'Error de conexión con el servidor de la hermandad.';
        }
      }
    });
  }

  /**
   * Navega hacia la ruta de registro para crear una cuenta nueva.
   * * @returns {void}
   */
  irAlRegistro(): void {
    this.router.navigate(['/registro']);
  }

  // #endregion
}