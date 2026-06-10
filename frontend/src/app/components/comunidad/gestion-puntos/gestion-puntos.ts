// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
// #endregion

@Component({
  selector: 'app-gestion-puntos',
  templateUrl: './gestion-puntos.html',
  styleUrls: ['./gestion-puntos.css'],
  standalone: false
})
export class GestionPuntos implements OnInit {

  // #region PROPIEDADES
  personajes: any[] = [];
  terminoBusqueda: string = '';
  cargando: boolean = true;
  procesando: boolean = false;

  auxClases: any[] = [];
  auxSpecs: any[] = [];
  auxFunciones: any[] = [];
  profesionesPrincipales: any[] = [];
  profesionesSecundarias: any[] = [];
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
   * Inicia la carga de datos maestros requeridos para construir 
   * los desplegables de configuración de la tabla.
   * * @returns {void}
   */
  ngOnInit(): void {
    this.cargarDatosAuxiliares();
  }
  // #endregion

  // #region UTILIDADES
  /**
   * Genera las cabeceras HTTP de autorización para las peticiones API.
   * Recupera el token JWT almacenado localmente.
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

  /**
   * Getter dinámico que devuelve la lista de personajes filtrada.
   * Se basa en el texto introducido en el buscador, comprobando coincidencias 
   * tanto en el nombre del personaje como en su reino.
   * * @returns {any[]}
   */
  get personajesFiltrados(): any[] {
    if (!this.terminoBusqueda) return this.personajes;
    return this.personajes.filter(p => 
      p.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) || 
      (p.reino && p.reino.toLowerCase().includes(this.terminoBusqueda.toLowerCase()))
    );
  }
  // #endregion

  // #region CARGA DE DATOS
  /**
   * Obtiene simultáneamente los catálogos auxiliares (clases, especializaciones, etc.).
   * Filtra las profesiones por nivel y, una vez resueltas todas las peticiones, 
   * desencadena la carga del listado de personajes.
   * * @returns {void}
   */
  cargarDatosAuxiliares(): void {
    this.cargando = true;
    forkJoin({
      clases: this.http.get<any[]>('http://192.168.1.130:8000/api/aux-clases', { headers: this.getHeaders() }),
      specs: this.http.get<any[]>('http://192.168.1.130:8000/api/aux-specs', { headers: this.getHeaders() }),
      profesiones: this.http.get<any[]>('http://192.168.1.130:8000/api/aux-profesiones', { headers: this.getHeaders() }),
      funciones: this.http.get<any[]>('http://192.168.1.130:8000/api/aux-funciones', { headers: this.getHeaders() })
    }).subscribe({
      next: (res) => {
        this.auxClases = res.clases;
        this.auxSpecs = res.specs;
        this.auxFunciones = res.funciones;
        this.profesionesPrincipales = res.profesiones.filter(p => p.nivel === 'Principal');
        this.profesionesSecundarias = res.profesiones.filter(p => p.nivel === 'Secundaria');
        this.cargarPersonajes();
      },
      error: () => {
        alert('Error al cargar datos auxiliares.');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Recupera el registro completo de todos los personajes almacenados.
   * Inicializa la propiedad virtual `puntosInput` a 0 para cada personaje 
   * con el fin de manejar de forma independiente las modificaciones en la interfaz.
   * * @returns {void}
   */
  cargarPersonajes(): void {
    this.http.get<any[]>('http://192.168.1.130:8000/api/aux-personajes', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.personajes = data.map(p => ({ ...p, puntosInput: 0 }));
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar personajes', err);
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }
  // #endregion

  // #region GESTIÓN Y EDICIÓN
  /**
   * Filtra y devuelve las especializaciones asociadas a una clase concreta.
   * Utilizado para poblar dinámicamente el desplegable de especializaciones 
   * cuando un oficial edita a un personaje.
   * * @param {string} claseNombre - El nombre de la clase a consultar.
   * @returns {any[]}
   */
  getSpecsDeClase(claseNombre: string): any[] {
    const claseObj = this.auxClases.find(c => c.nombre === claseNombre);
    return claseObj ? this.auxSpecs.filter(s => s.codigoClase === claseObj.codigo) : [];
  }

  /**
   * Escucha el evento de cambio en el selector de clase de un personaje.
   * Resetea su especialización actual para evitar inconsistencias y dispara 
   * el autoguardado de la configuración.
   * * @param {any} p - El objeto del personaje que está siendo editado.
   * @returns {void}
   */
  onClaseChange(p: any): void {
    p.spec = ''; 
    this.guardarConfiguracion(p);
  }

  /**
   * Procesa la información editada de un personaje y la envía al servidor.
   * Deduce automáticamente la función de combate (Tanque, DPS, Sanador) cruzando 
   * la especialización seleccionada con las tablas auxiliares antes de enviar el payload.
   * * @param {any} p - El objeto del personaje modificado.
   * @returns {void}
   */
  guardarConfiguracion(p: any): void {
    const claseObj = this.auxClases.find(c => c.nombre === p.clase);
    const specObj = this.auxSpecs.find(s => s.nombre === p.spec && s.codigoClase === claseObj?.codigo);
    p.funcion = this.auxFunciones.find(f => f.codigo === specObj?.codigoFuncion)?.nombre || '';

    const payload = {
      codigo: p.codigo,
      clase: p.clase || '',
      spec: p.spec || '',
      funcion: p.funcion,
      profesion1: p.profesion1 || '',
      profesion2: p.profesion2 || '',
      profesion_sec1: p.profesion_sec1 || '',
      profesion_sec2: p.profesion_sec2 || ''
    };

    this.http.post('http://192.168.1.130:8000/api/actualizar-configuracion-oficial', payload, { headers: this.getHeaders() })
      .subscribe({
        error: () => alert(`Fallo al guardar los datos de ${p.nombre}.`)
      });
  }

  /**
   * Incrementa o decrementa la puntuación (ej. DKP) de un personaje específico.
   * Evita envíos nulos o con valor 0. Actualiza la vista en tiempo real tras la 
   * respuesta exitosa de la API y resetea el input de ese personaje.
   * * @param {any} personaje - El objeto del personaje al que se modificarán los puntos.
   * @returns {void}
   */
  otorgarPuntos(personaje: any): void {
    if (!personaje.puntosInput || personaje.puntosInput === 0) return;

    this.procesando = true;
    const payload = { codigo: personaje.codigo, cantidad: personaje.puntosInput };

    this.http.post('http://192.168.1.130:8000/api/actualizar-puntos', payload, { headers: this.getHeaders() })
      .subscribe({
        next: (res: any) => {
          personaje.puntos = res.nuevosPuntos;
          personaje.puntosInput = 0; 
          this.procesando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.procesando = false;
          alert('Hubo un error al actualizar los puntos.');
          this.cdr.detectChanges();
        }
      });
  }
  // #endregion
}