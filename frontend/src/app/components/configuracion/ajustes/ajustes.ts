import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.html',
  styleUrls: ['./ajustes.css'],
  standalone: false
})
export class Ajustes implements OnInit {

  // Datos del usuario actual
  usuarioActual: any = null;

  // Formularios
  nuevoEmail: string = '';
  passActual: string = '';
  passNueva: string = '';
  passConfirmar: string = '';

  // Estados
  cargando: boolean = false;

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.obtenerDatosUsuario();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    });
  }

  obtenerDatosUsuario() {
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

  actualizarEmail() {
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

  actualizarPassword() {
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

  borrarCuenta() {
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
}