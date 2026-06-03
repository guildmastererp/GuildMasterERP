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

  // #region METODOS

    // #region HOOKS
  ngOnInit(): void {
    this.obtenerDatosUsuarioLaravel();
  }
    // #endregion

    // #region 1. OBTENER DATOS DE LA BASE DE DATOS (LARAVEL)
  /**
   * @description Llama a la ruta protegida de Sanctum para obtener el registro del usuario logueado.
   */
// #region 1. OBTENER DATOS DE LA BASE DE DATOS (LARAVEL)
  /**
   * @description Llama a la ruta protegida de Sanctum enviando el Token de sesión
   * para obtener el registro del usuario logueado.
   */
  obtenerDatosUsuarioLaravel() {
    // 1. Recuperamos el token de donde lo guarde tu sistema de Login 
    // (Ajusta la palabra 'token' si en tu localStorage lo llamas de otra forma, ej: 'auth_token')
    const token = localStorage.getItem('token');

    // Freno de seguridad local
    if (!token) {
      this.mostrarError('No hay sesión activa. Por favor, pasa por la pantalla de Login.');
      return;
    }

    // 2. Preparamos el "Pase VIP" para Sanctum
    const opciones = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    };

    // 3. Enviamos la petición con las cabeceras incluidas
    this.http.get('http://192.168.1.132:8000/api/user', opciones).subscribe({
      next: (user: any) => {
        if (user.region && user.reino && user.nombre_main) {
          this.cargarPerfilRaiderIo(user.region, user.reino, user.nombre_main);
        } else {
          this.mostrarError('El usuario no tiene un personaje principal registrado en la BD.');
        }
      },
      error: (err) => {
        console.error('Error al obtener la sesión de Laravel:', err);
        // Si el token caducó o es falso, Laravel rechaza la petición
        this.mostrarError('Tu sesión ha expirado o no es válida. Vuelve a iniciar sesión.');
      }
    });
  }
    // #endregion
    // #endregion

    // #region 2. CONSUMIR API DE RAIDER.IO
  /**
   * @description Construye la URL dinámicamente con los datos de la tabla users y usa fetch.
   */
  async cargarPerfilRaiderIo(region: string, reino: string, nombre: string) {
    try {
      // Limpiamos los textos por si el reino tiene espacios (ej: "Dun Modr" -> "dun-modr")
      const regionLimpia = region.toLowerCase().trim();
      const reinoLimpio = reino.toLowerCase().trim().replace(/\s+/g, '-');
      const nombreLimpio = nombre.toLowerCase().trim();

      const apiUrl = `https://raider.io/api/v1/characters/profile?region=${regionLimpia}&realm=${reinoLimpio}&name=${nombreLimpio}&fields=gear,mythic_plus_scores_by_season:current,raid_progression`;

      // Bypasseamos el HttpClient para no mandar el Token de Laravel a Raider.io
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

    // Forzamos el repintado de la pantalla
    this.cdr.detectChanges();
  }
    // #endregion

    // #region UTILIDADES
  mostrarError(mensaje: string) {
    this.mensajeError = mensaje;
    this.errorCarga = true;
    this.cargando = false;
    this.cdr.detectChanges();
  }
    // #endregion

  // #endregion
}