// #region IMPORTS

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// #endregion

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
  standalone: false
})
export class Perfil implements OnInit {

  // #region PROPIEDADES

  personajes: any[] = [];
  personajeSeleccionado: any = null;
  codigoSeleccionado: string = ''; 
  nuevoLinkRaiderIo: string = '';
  
  characterData: any = null;
  cargando: boolean = true;
  errorCarga: boolean = false;
  mensajeError: string = 'Invocando datos desde las Tierras Sombrías...';

  // #endregion

  // #region CONSTRUCTOR

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  // #endregion

  // #region METODOS

    // #region HOOKS
    
  /**
   * @description Inicializa el componente ejecutando la carga inicial del roster de personajes del usuario.
   */
  ngOnInit(): void {
    this.cargarListaPersonajes();
  }

    // #endregion

    // #region UTILIDADES Y CONFIGURACIÓN

  /**
   * @description Genera los encabezados HTTP necesarios para las peticiones al backend, incluyendo el token de autorización JWT.
   * @returns Instancia de HttpHeaders con la configuración de seguridad y formato.
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  /**
   * @description Maneja la visualización de estados de error en la interfaz. Detiene el estado de carga y actualiza el mensaje.
   * @param m Cadena de texto con el mensaje de error a mostrar al usuario.
   */
  mostrarError(m: string) {
    this.mensajeError = m;
    this.errorCarga = true;
    this.cargando = false;
    this.cdr.detectChanges(); 
  }

    // #endregion

    // #region GESTIÓN DE PERSONAJES Y ESTADO

  /**
   * @description Obtiene la lista completa de personajes (mains y alters) asociados a la cuenta del usuario desde la API.
   * Si existen personajes, selecciona automáticamente el marcado como 'main' o el primero de la lista.
   */
  cargarListaPersonajes() {
    this.cargando = true;
    this.http.get<any[]>('http://192.168.1.132:8000/api/mis-personajes', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.personajes = data;
          if (this.personajes.length > 0) {
            const main = this.personajes.find(p => p.es_main == 1 || p.es_main === true) || this.personajes[0];
            this.actualizarPersonaje(main);
          } else {
            this.mostrarError('No tienes personajes registrados.');
          }
        },
        error: () => this.mostrarError('Error al cargar tu roster.')
      });
  }

  /**
   * @description Centraliza el proceso de cambio de personaje activo en el panel, actualizando el selector y disparando la búsqueda en Raider.io.
   * @param personaje Objeto completo del personaje seleccionado.
   */
  actualizarPersonaje(personaje: any) {
    this.personajeSeleccionado = personaje;
    this.codigoSeleccionado = personaje.codigo; 
    this.cargarPerfilRaiderIo(personaje.region, personaje.reino, personaje.nombre);
  }

  /**
   * @description Intercepta el cambio de valor en el selector desplegable (combobox) y sincroniza el estado de la vista.
   * @param codigo Código identificador único del personaje seleccionado en la vista.
   */
  onCodigoCambiado(codigo: string) {
    const encontrado = this.personajes.find(p => p.codigo === codigo);
    if (encontrado) {
      this.actualizarPersonaje(encontrado);
    }
  }

  /**
   * @description Marca el personaje actualmente visible como el principal (main) en la base de datos del ERP.
   * Tras una respuesta exitosa, recarga la lista para actualizar los indicadores visuales.
   */
  marcarComoMain() {
    if(!this.personajeSeleccionado) return;
    this.http.post('http://192.168.1.132:8000/api/marcar-main', { codigo: this.codigoSeleccionado }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          alert('Personaje principal actualizado.');
          this.cargarListaPersonajes();
        },
        error: () => alert('Error al actualizar el personaje principal.')
      });
  }

  /**
   * @description Registra un nuevo alter en la cuenta del usuario validando y enviando un enlace de Raider.io.
   * Limpia el formulario y recarga el roster tras una inserción exitosa.
   */
  agregarNuevoPersonaje() {
    if (!this.nuevoLinkRaiderIo) {
      alert('Introduce un enlace válido.');
      return;
    }
    this.cargando = true;
    this.http.post('http://192.168.1.132:8000/api/añadir-personaje', { raiderio_url: this.nuevoLinkRaiderIo }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          alert('Alter añadido a tu cuenta.');
          this.nuevoLinkRaiderIo = '';
          this.cargarListaPersonajes();
        },
        error: () => {
          this.cargando = false;
          alert('Error al añadir el personaje. Comprueba que el enlace es correcto.');
        }
      });
  }

    // #endregion

    // #region INTEGRACIÓN CON RAIDER.IO

  /**
   * @description Realiza una petición GET a la API de Raider.io para obtener información detallada del personaje (equipo, índice mítico y progresión de banda).
   * Filtra las raids históricas para mostrar únicamente el contenido de las temporadas actuales.
   * @param region Región del servidor (ej. 'eu', 'us').
   * @param reino Nombre del servidor del personaje (ej. 'dun-modr').
   * @param nombre Nombre del personaje.
   */
  cargarPerfilRaiderIo(region: string, reino: string, nombre: string) {
    this.cargando = true;
    this.errorCarga = false;
    this.characterData = null;

    const regionLimpia = region.toLowerCase().trim();
    const reinoLimpio = reino.toLowerCase().trim().replace(/\s+/g, '-');
    const nombreLimpio = nombre.toLowerCase().trim();

    const apiUrl = `https://raider.io/api/v1/characters/profile?region=${regionLimpia}&realm=${reinoLimpio}&name=${nombreLimpio}&fields=gear,mythic_plus_scores_by_season:current,raid_progression`;

    this.http.get(apiUrl).subscribe({
      next: (data: any) => {
        
        // Filtro: Limpiamos el histórico de raids para quedarnos con el contenido reciente
        if (data.raid_progression) {
          const raidsActuales = Object.keys(data.raid_progression).filter(key => 
            !key.startsWith('tier-') && key !== 'world-of-warcraft-remix-mists-of-pandaria'
          );

          const progresoFiltrado: any = {};
          raidsActuales.forEach(key => {
            progresoFiltrado[key] = data.raid_progression[key];
          });
          
          data.raid_progression = progresoFiltrado;
        }

        this.characterData = data;
        this.cargando = false;
        this.errorCarga = false;
      },
      error: (e) => {
        console.error('Fallo en Raider.io:', e);
        this.mostrarError('No se pudo sincronizar el personaje de Raider.io.');
      }
    });
  }

    // #endregion

  // #endregion
}