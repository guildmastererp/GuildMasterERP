// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
// #endregion

@Component({
  selector: 'app-inscripcion-eventos',
  templateUrl: './inscripcion.html',
  styleUrls: ['./inscripcion.css'],
  standalone: false
})
export class Inscripcion implements OnInit {

  // #region PROPIEDADES DE DATOS
  eventosProximos: any[] = [];
  misPersonajes: any[] = [];

  personajeSeleccionado: { [codigoEvento: string]: string } = {};
  procesando: boolean = false;
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
   * Dispara la carga concurrente de personajes y próximos eventos
   * al montar el componente.
   * * @returns {void}
   */
  ngOnInit(): void {
    this.cargarDatosIniciales(); 
  }
  // #endregion

  // #region UTILIDADES
  /**
   * Genera las cabeceras HTTP de autorización.
   * * @private
   * @returns {HttpHeaders}
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 
      'Authorization': `Bearer ${localStorage.getItem('token')}`, 
      'Accept': 'application/json' 
    });
  }

  /**
   * Método auxiliar para determinar localmente si el usuario ya está inscrito
   * en un evento con alguno de sus personajes.
   * * @private
   * @param {any} evento - El evento a comprobar.
   * @param {any[]} misPjs - Lista de personajes del usuario.
   * @returns {any|null} El registro de inscripción encontrado o null.
   */
  private obtenerInscripcionLocal(evento: any, misPjs: any[]): any {
    if (!evento.inscritos || misPjs.length === 0) return null;
    for (let miPj of misPjs) {
      const inscrito = evento.inscritos.find((i: any) => i.codigo === miPj.codigo);
      if (inscrito) return inscrito; 
    }
    return null;
  }
  // #endregion

  // #region CARGA DE DATOS
  /**
   * Carga inicial de datos. Obtiene en paralelo la lista de personajes y
   * la lista de eventos para asegurar que la vista tenga toda la información necesaria.
   * Realiza pre-formateo de fechas y precálculo de inscripciones.
   * * @returns {void}
   */
  cargarDatosIniciales(): void {
    const peticionPersonajes = this.http.get<any[]>('http://192.168.1.130:8000/api/mis-personajes', { headers: this.getHeaders() });
    const peticionEventos = this.http.get<any[]>('http://192.168.1.130:8000/api/eventos/proximos', { headers: this.getHeaders() });

    forkJoin({
      personajes: peticionPersonajes,
      eventos: peticionEventos
    }).subscribe({
      next: (res) => {
        this.misPersonajes = res.personajes;
        
        this.eventosProximos = res.eventos.map((e: any) => {
          if (e.fecha_evento) {
            e.fecha_evento_limpia = e.fecha_evento.replace(' ', 'T');
          }
          e.miInscripcion = this.obtenerInscripcionLocal(e, this.misPersonajes);
          return e;
        });
        
        this.eventosProximos.forEach(e => {
          if (this.misPersonajes.length > 0) {
            const main = this.misPersonajes.find(p => p.es_main == 1 || p.es_main === true);
            this.personajeSeleccionado[e.codigo] = main ? main.codigo : this.misPersonajes[0].codigo;
          }
        });
        
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  /**
   * Recarga la lista de eventos sin recargar los personajes.
   * Utilizado tras acciones de inscripción o desinscripción.
   * * @returns {void}
   */
  cargarEventosProximos(): void {
    this.http.get<any[]>('http://192.168.1.130:8000/api/eventos/proximos', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.eventosProximos = data.map((e: any) => {
            if (e.fecha_evento) e.fecha_evento_limpia = e.fecha_evento.replace(' ', 'T');
            e.miInscripcion = this.obtenerInscripcionLocal(e, this.misPersonajes);
            return e;
          });
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }
  // #endregion

  // #region GESTIÓN DE INSCRIPCIONES
  /**
   * Registra la inscripción del personaje seleccionado en un evento.
   * * @param {string} codigoEvento - Identificador del evento.
   * * @returns {void}
   */
  inscribirse(codigoEvento: string): void {
    const codPj = this.personajeSeleccionado[codigoEvento];
    if (!codPj) {
      alert("Selecciona un personaje primero.");
      return;
    }

    this.procesando = true; 

    const body = { codigo_evento: codigoEvento, codigo_personaje: codPj };
    this.http.post('http://192.168.1.130:8000/api/eventos/inscribir', body, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.cargarEventosProximos(); 
          this.procesando = false; 
        },
        error: () => {
          this.procesando = false; 
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Elimina la inscripción de un personaje en un evento específico.
   * * @param {string} codigoEvento - Identificador del evento.
   * * @param {string} codigoPersonaje - Identificador del personaje.
   * * @returns {void}
   */
  desapuntarse(codigoEvento: string, codigoPersonaje: string): void {
    this.procesando = true; 

    this.http.delete(`http://192.168.1.130:8000/api/eventos/desinscribir/${codigoEvento}/${codigoPersonaje}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.cargarEventosProximos();
          this.procesando = false; 
        },
        error: () => {
          this.procesando = false; 
          this.cdr.detectChanges();
        }
      });
  }
  // #endregion
}