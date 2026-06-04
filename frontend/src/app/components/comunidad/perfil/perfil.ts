// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// #endregion

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
  standalone: false
})
export class Perfil implements OnInit {

  // #region PROPIEDADES
  characterData: any = null;
  cargando: boolean = true;
  errorCarga: boolean = false;
  mensajeError: string = 'Invocando datos desde las Tierras Sombrías...';
  // #endregion

  // #region CONSTRUCTOR
  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef
  ) {}
  // #endregion

  // #region MÉTODOS

  ngOnInit(): void {
    this.obtenerDatosUsuarioLaravel();
  }

  /**
   * @description Llama a la ruta protegida de Sanctum para obtener el usuario y su personaje relacionado.
   */
  obtenerDatosUsuarioLaravel() {
    const token = localStorage.getItem('token');

    if (!token) {
      this.mostrarError('No hay sesión activa. Por favor, pasa por la pantalla de Login.');
      return;
    }

    const opciones = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    };

    this.http.get('http://192.168.1.132:8000/api/user', opciones).subscribe({
      next: (user: any) => {
        // Accedemos a la relación cargada 'personaje'
        if (user && user.personaje && user.personaje.region && user.personaje.reino && user.personaje.nombre) {
          this.cargarPerfilRaiderIo(user.personaje.region, user.personaje.reino, user.personaje.nombre);
        } else {
          this.mostrarError('El usuario no tiene un personaje principal registrado en la base de datos.');
        }
      },
      error: (err) => {
        console.error('Error al obtener la sesión de Laravel:', err);
        this.mostrarError('Tu sesión ha expirado o no es válida. Vuelve a iniciar sesión.');
      }
    });
  }

  /**
   * @description Consume la API de Raider.io con los datos obtenidos.
   */
  async cargarPerfilRaiderIo(region: string, reino: string, nombre: string) {
    try {
      const regionLimpia = region.toLowerCase().trim();
      const reinoLimpio = reino.toLowerCase().trim().replace(/\s+/g, '-');
      const nombreLimpio = nombre.toLowerCase().trim();

      const apiUrl = `https://raider.io/api/v1/characters/profile?region=${regionLimpia}&realm=${reinoLimpio}&name=${nombreLimpio}&fields=gear,mythic_plus_scores_by_season:current,raid_progression`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Personaje no encontrado en la armería de Raider.io');
      }

      this.characterData = await response.json();
      this.cargando = false;

    } catch (e) {
      console.error('Fallo en Raider.io:', e);
      this.mostrarError('No se pudo sincronizar el personaje. Verifica que exista en Raider.io.');
    }

    this.cdr.detectChanges();
  }

  /**
   * @description Gestiona la visualización de errores.
   */
  mostrarError(mensaje: string) {
    this.mensajeError = mensaje;
    this.errorCarga = true;
    this.cargando = false;
    this.cdr.detectChanges();
  }

  // #endregion
}