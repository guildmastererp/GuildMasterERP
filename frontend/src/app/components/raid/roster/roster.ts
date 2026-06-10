// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// #endregion

@Component({
  selector: 'app-roster',
  templateUrl: './roster.html',
  styleUrls: ['./roster.css'],
  standalone: false
})
export class Roster implements OnInit {

  // #region PROPIEDADES
  esAdmin: boolean = false;
  cargandoRol: boolean = true;
  procesando: boolean = false;
  terminoBusqueda: string = '';

  rosterActual: any[] = [];
  todosPersonajes: any[] = [];
  // #endregion

  // #region CONSTRUCTOR
  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef
  ) {}
  // #endregion

  // #region CICLO DE VIDA
  /**
   * Ciclo de vida de inicialización.
   * Inicia la comprobación de privilegios de usuario para habilitar 
   * las funcionalidades administrativas.
   */
  ngOnInit(): void {
    this.comprobarRol();
  }
  // #endregion

  // #region UTILIDADES
  /**
   * Genera las cabeceras HTTP de autorización estándar.
   * @private
   * @returns {HttpHeaders}
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    });
  }
  // #endregion

  // #region CARGA Y GESTIÓN DE DATOS
  /**
   * Consulta el rol del usuario autenticado. 
   * Si es administrador (0001 o 0002), dispara la carga de datos del roster.
   */
  comprobarRol(): void {
    this.http.get<any>('http://192.168.1.130:8000/api/user', { headers: this.getHeaders() })
      .subscribe({
        next: (user) => {
          this.cargandoRol = false;
          if (user.codigo_rol === '0001' || user.codigo_rol === '0002') {
            this.esAdmin = true;
            this.cargarDatos();
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.cargandoRol = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Wrapper para ejecutar la carga de ambos sets de datos necesarios.
   */
  cargarDatos(): void {
    this.cargarRoster();
    this.cargarPersonajesParaBuscador();
  }

  /**
   * Obtiene la lista actual de personajes inscritos en el roster de raid.
   */
  cargarRoster(): void {
    this.http.get<any[]>('http://192.168.1.130:8000/api/roster', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.rosterActual = data;
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }

  /**
   * Obtiene la lista global de personajes para poder buscarlos y añadirlos al roster.
   */
  cargarPersonajesParaBuscador(): void {
    this.http.get<any[]>('http://192.168.1.130:8000/api/aux-personajes', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.todosPersonajes = data;
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }
  // #endregion

  // #region LÓGICA DE BÚSQUEDA
  /**
   * Getter que filtra los personajes disponibles para añadir al roster.
   * Excluye a los que ya están presentes en `rosterActual` y filtra por nombre,
   * clase o función según el término de búsqueda.
   * @returns {any[]} Lista de personajes candidatos.
   */
  get resultadosBuscador(): any[] {
    if (!this.terminoBusqueda) return [];

    const codigosEnRoster = this.rosterActual.map(r => r.codigo);
    const disponibles = this.todosPersonajes.filter(p => !codigosEnRoster.includes(p.codigo));

    return disponibles.filter(p => 
      p.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) || 
      p.clase.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
      p.funcion.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
    );
  }
  // #endregion

  // #region ACCIONES DEL ROSTER
  /**
   * Añade un nuevo personaje al roster mediante una petición POST.
   * Actualiza el roster local tras la operación.
   * @param {any} personaje - Objeto del personaje a añadir.
   */
  agregarAlRoster(personaje: any): void {
    this.procesando = true;
    this.http.post('http://192.168.1.130:8000/api/roster/add', { codigoPersonaje: personaje.codigo }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.terminoBusqueda = ''; 
          this.cargarRoster(); 
          this.procesando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.procesando = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Elimina un personaje del roster mediante una petición DELETE.
   * Actualiza el roster local tras la operación.
   * @param {any} personaje - Objeto del personaje a expulsar.
   */
  expulsarDelRoster(personaje: any): void {
    this.procesando = true;
    this.http.delete(`http://192.168.1.130:8000/api/roster/remove/${personaje.codigo}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.cargarRoster();
          this.procesando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.procesando = false;
          this.cdr.detectChanges();
        }
      });
  }
  // #endregion

  // #region UTILIDADES DE VISTA
  /**
   * Devuelve el emoji correspondiente normalizando el texto de la función
   * para evitar fallos por mayúsculas, minúsculas o espacios en blanco.
   */
  obtenerIconoRol(funcion: string): string {
    if (!funcion) return '❔';
    const f = funcion.trim().toLowerCase();
    
    if (f === 'tanque') return '🛡️';
    if (f === 'sanador' || f === 'healer') return '💚';
    if (f === 'dps') return '⚔️';
    
    return '❔';
  }
  // #endregion
}