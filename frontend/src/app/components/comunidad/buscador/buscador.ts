// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// #endregion

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.html',
  styleUrls: ['./buscador.css'],
  standalone: false
})
export class Buscador implements OnInit {

  // #region PROPIEDADES
  personajes: any[] = [];
  cargando: boolean = true;
  errorCarga: boolean = false;

  filtroNombre: string = '';
  filtroReino: string = '';
  filtroRegion: string = '';
  filtroSpec: string = '';
  filtroProfesion: string = '';
  filtroFuncion: string = '';

  reinosDisponibles: string[] = [];
  regionesDisponibles: string[] = [];
  specsDisponibles: string[] = [];
  profesionesDisponibles: string[] = [];
  funcionesDisponibles: string[] = [];
  // #endregion

  // #region CONSTRUCTOR
  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef
  ) {}
  // #endregion

  // #region CICLO DE VIDA
  /**
   * Ciclo de vida de inicialización del componente.
   * Dispara la carga completa del censo de personajes de la hermandad 
   * en el momento en que se monta la vista.
   * * @returns {void}
   */
  ngOnInit(): void {
    this.cargarTodosLosPersonajes();
  }
  // #endregion

  // #region UTILIDADES
  /**
   * Genera y devuelve las cabeceras HTTP de autorización estándar.
   * Inyecta el token JWT almacenado localmente para permitir el acceso a la API.
   * * @private
   * @returns {HttpHeaders}
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }
  // #endregion

  // #region CARGA Y PROCESAMIENTO DE DATOS
  /**
   * Obtiene el listado maestro de todos los personajes registrados en el sistema.
   * Normaliza la respuesta del servidor en caso de variaciones en la estructura del JSON,
   * y desencadena la extracción de filtros dinámicos si se encuentran datos.
   * * @returns {void}
   */
  cargarTodosLosPersonajes(): void {
    this.cargando = true;
    this.errorCarga = false;

    this.http.get<any>('http://192.168.1.130:8000/api/aux-personajes', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.personajes = data;
          } else if (data && data.personajes && Array.isArray(data.personajes)) {
            this.personajes = data.personajes;
          } else {
            this.personajes = [];
          }

          if (this.personajes.length > 0) {
             this.extraerFiltrosDinamicos();
          }

          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorCarga = true;
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Analiza la lista actual de personajes para extraer valores únicos.
   * Puebla automáticamente los arrays utilizados en los menús desplegables 
   * (reinos, regiones, specs, etc.) basándose exclusivamente en los datos reales existentes.
   * * @private
   * @returns {void}
   */
  private extraerFiltrosDinamicos(): void {
    this.reinosDisponibles = [...new Set(this.personajes.map(p => p.reino))].filter(Boolean) as string[];
    this.regionesDisponibles = [...new Set(this.personajes.map(p => p.region))].filter(Boolean) as string[];
    this.specsDisponibles = [...new Set(this.personajes.map(p => p.spec))].filter(Boolean) as string[];
    this.funcionesDisponibles = [...new Set(this.personajes.map(p => p.funcion))].filter(Boolean) as string[];

    // CORRECCIÓN: Extraemos las profesiones de los 4 campos posibles
    const todasLasProfesiones = this.personajes.flatMap(p => [p.profesion1, p.profesion2, p.profesion_sec1, p.profesion_sec2]);
    this.profesionesDisponibles = [...new Set(todasLasProfesiones)].filter(Boolean) as string[];
  }
  // #endregion

  // #region FILTRADO Y BÚSQUEDA
  /**
   * Getter dinámico que evalúa la lista de personajes contra todos los criterios de búsqueda activos.
   * Comprueba coincidencias de texto parcial en el nombre y coincidencias exactas en los selectores.
   * Escanea los 4 slots de profesión de cada personaje para validar el filtro de profesiones.
   * * @returns {any[]} Array de personajes que cumplen con todas las condiciones actuales.
   */
  get personajesFiltrados(): any[] {
    if (!this.personajes) return [];

    return this.personajes.filter(p => {
      const coincideNombre = p.nombre ? p.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase()) : false;
      const coincideReino = this.filtroReino ? p.reino === this.filtroReino : true;
      const coincideRegion = this.filtroRegion ? p.region === this.filtroRegion : true;
      const coincideSpec = this.filtroSpec ? p.spec === this.filtroSpec : true;
      const coincideFuncion = this.filtroFuncion ? p.funcion === this.filtroFuncion : true;
      
      let coincideProfesion = true;
      if (this.filtroProfesion) {
        coincideProfesion = (p.profesion1 === this.filtroProfesion) || 
                            (p.profesion2 === this.filtroProfesion) || 
                            (p.profesion_sec1 === this.filtroProfesion) || 
                            (p.profesion_sec2 === this.filtroProfesion);
      }

      return coincideNombre && coincideReino && coincideRegion && coincideSpec && coincideProfesion && coincideFuncion;
    });
  }

  /**
   * Restablece todos los parámetros de filtrado a su estado inicial.
   * Vacía los inputs y selectores de la vista, mostrando nuevamente el censo completo.
   * * @returns {void}
   */
  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroReino = '';
    this.filtroRegion = '';
    this.filtroSpec = '';
    this.filtroProfesion = '';
    this.filtroFuncion = '';
    this.cdr.detectChanges();
  }
  // #endregion
}