// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
// #endregion

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.html',
  styleUrls: ['./ajustes.css'],
  standalone: false
})
export class Ajustes implements OnInit {

  // #region PROPIEDADES 
  usuarioActual: any = null;

  nuevoEmail: string = '';
  passActual: string = '';
  passNueva: string = '';
  passConfirmar: string = '';

  cargando: boolean = false;
  // #endregion

  // #region CONSTRUCTOR
  constructor(
    private http: HttpClient, 
    private router: Router, 
    private cdr: ChangeDetectorRef
  ) {}
  // #endregion

  // #region CICLO DE VIDA
  /**
   * Ciclo de vida de inicialización.
   * Recupera la información del usuario autenticado para rellenar 
   * el formulario de perfil.
   * * @returns {void}
   */
  ngOnInit(): void {
    this.obtenerDatosUsuario();
  }
  // #endregion

  // #region UTILIDADES
  /**
   * Genera las cabeceras HTTP necesarias para las peticiones autenticadas.
   * Utiliza el token Bearer almacenado en el LocalStorage.
   * * @private
   * @returns {HttpHeaders}
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    });
  }
  // #endregion

  // #region GESTIÓN DE CUENTA
  /**
   * Obtiene los datos del perfil del usuario logueado actualmente.
   * Inicializa las propiedades del formulario con la información recibida.
   * * @returns {void}
   */
  obtenerDatosUsuario(): void {
    this.http.get<any>('http://192.168.1.130:8000/api/user', { headers: this.getHeaders() })
      .subscribe({
        next: (user) => {
          this.usuarioActual = user;
          this.nuevoEmail = user.email;
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }

  /**
   * Envía la solicitud para actualizar la dirección de correo electrónico.
   * * @returns {void}
   */
  actualizarEmail(): void {
    if (!this.nuevoEmail) return;
    this.cargando = true;
    
    this.http.post('http://192.168.1.130:8000/api/ajustes/email', { email: this.nuevoEmail }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.cargando = false;
          alert('Correo actualizado con éxito.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.cargando = false;
          alert(err.error.message || 'Error al actualizar el correo.');
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Envía la solicitud para cambiar la contraseña actual del usuario.
   * Valida la coincidencia entre la nueva contraseña y su confirmación.
   * * @returns {void}
   */
  actualizarPassword(): void {
    if (!this.passActual || !this.passNueva || !this.passConfirmar) return;
    this.cargando = true;

    const payload = {
      current_password: this.passActual,
      new_password: this.passNueva,
      new_password_confirmation: this.passConfirmar
    };

    this.http.post('http://192.168.1.130:8000/api/ajustes/password', payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.cargando = false;
          this.passActual = '';
          this.passNueva = '';
          this.passConfirmar = '';
          alert('Contraseña cambiada con éxito.');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.cargando = false;
          alert(err.error.message || 'Error al cambiar la contraseña. Verifica los datos.');
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Solicita la eliminación irreversible de la cuenta y sus datos vinculados.
   * Tras la confirmación del usuario, limpia el almacenamiento local, 
   * invalida la sesión y redirige al login.
   * * @returns {void}
   */
  borrarCuenta(): void {
    const confirmacion = confirm('ATENCIÓN: Esta acción es irreversible. Se borrará tu cuenta, tu personaje principal y todos tus alters. ¿Estás absolutamente seguro?');
    
    if (confirmacion) {
      this.cargando = true;
      this.http.delete('http://192.168.1.130:8000/api/ajustes/borrar', { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            alert('Tu cuenta ha sido eliminada. Volviendo a la pantalla de inicio...');
            localStorage.clear();
            this.router.navigate(['/login']).then(() => {
              window.location.reload(); 
            });
          },
          error: () => {
            this.cargando = false;
            alert('Error al intentar eliminar la cuenta.');
            this.cdr.detectChanges();
          }
        });
    }
  }
  // #endregion
}