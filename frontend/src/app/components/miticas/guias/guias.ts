// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// #endregion

@Component({
  selector: 'app-guias-miticas',
  templateUrl: './guias.html',
  styleUrls: ['./guias.css'],
  standalone: false
})
export class Guias implements OnInit {

  // #region PROPIEDADES DE DATOS
  guiasConMazmorras: any[] = []; 
  datosOriginales: any[] = []; 

  expansionesDisponibles: any[] = [];
  temporadasDisponibles: any[] = [];

  cargando: boolean = true;
  errorCarga: boolean = false;

  filtroBusqueda: string = '';
  filtroExpansion: string = '';
  filtroTemporada: string = '';
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
   * Lanza la carga de datos maestros al montar el componente.
   * * @returns {void}
   */
  ngOnInit(): void {
    this.cargarDatosMaestros();
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
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }
  // #endregion

  // #region CARGA Y AGRUPACIÓN DE DATOS
  /**
   * Obtiene la estructura de expansiones y temporadas desde la API.
   * Posteriormente, encadena la carga de las guías.
   * * @returns {void}
   */
  cargarDatosMaestros(): void {
    this.cargando = true;
    
    this.http.get<any>('http://192.168.1.130:8000/api/miticas/estructura', { headers: this.getHeaders() })
      .subscribe({
        next: (estructura) => {
          this.expansionesDisponibles = estructura.expansiones;
          this.temporadasDisponibles = estructura.temporadas;
          this.cargarGuias();
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorCarga = true;
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Obtiene la lista cruda de guías y dispara el proceso de agrupación.
   * * @returns {void}
   */
  cargarGuias(): void {
    this.http.get<any[]>('http://192.168.1.130:8000/api/miticas/guias-lista', { headers: this.getHeaders() })
      .subscribe({
        next: (guias) => {
          this.agruparDatos(guias);
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorCarga = true;
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Transforma el listado plano de guías en un objeto agrupado por mazmorra.
   * Incluye la lógica para asociar el código de expansión mediante la búsqueda en temporadas.
   * * @param {any[]} guiasRaw - Datos crudos recibidos de la API.
   * * @returns {void}
   */
  agruparDatos(guiasRaw: any[]): void {
    const agrupado: any[] = [];

    guiasRaw.forEach(guia => {
      let mazmorraGrupo = agrupado.find(m => m.codigo === guia.codigoMitica);

      if (!mazmorraGrupo) {
        mazmorraGrupo = {
          codigo: guia.codigoMitica,
          nombre: guia.nombre_mazmorra,
          codigoTemporada: guia.codigoTemporada,
          codigoExpansion: this.temporadasDisponibles.find(t => t.codigo === guia.codigoTemporada)?.codigoExpa,
          guias: []
        };
        agrupado.push(mazmorraGrupo);
      }

      mazmorraGrupo.guias.push({
        id: guia.id,
        titulo: guia.titulo,
        url: guia.url,
        tipo: guia.tipo || 'General' 
      });
    });

    this.datosOriginales = agrupado;
    this.aplicarFiltros();
  }
  // #endregion

  // #region FILTRADO DE LA VISTA
  /**
   * Getter que devuelve únicamente las temporadas correspondientes a la expansión seleccionada.
   * * @returns {any[]} Array de temporadas filtradas.
   */
  get temporadasFiltradas(): any[] { 
    return this.temporadasDisponibles.filter(t => t.codigoExpa == this.filtroExpansion); 
  }

  /**
   * Aplica los filtros de expansión, temporada y búsqueda sobre los datos originales.
   * Realiza una copia profunda (deep clone) para evitar mutaciones no deseadas.
   * * @returns {void}
   */
  aplicarFiltros(): void {
    let resultado = JSON.parse(JSON.stringify(this.datosOriginales));

    if (this.filtroExpansion) {
      resultado = resultado.filter((m: any) => m.codigoExpansion === this.filtroExpansion);
    }

    if (this.filtroTemporada) {
      resultado = resultado.filter((m: any) => m.codigoTemporada === this.filtroTemporada);
    }

    if (this.filtroBusqueda) {
      const termino = this.filtroBusqueda.toLowerCase();
      resultado.forEach((mazmorra: any) => {
        mazmorra.guias = mazmorra.guias.filter((g: any) => g.titulo.toLowerCase().includes(termino));
      });
      resultado = resultado.filter((m: any) => m.guias.length > 0 || m.nombre.toLowerCase().includes(termino));
    }

    this.guiasConMazmorras = resultado;
    this.cdr.detectChanges();
  }

  /**
   * Restablece los filtros a su estado por defecto y recarga la vista completa.
   * * @returns {void}
   */
  limpiarFiltros(): void {
    this.filtroExpansion = '';
    this.filtroTemporada = '';
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }
  // #endregion

  // #region ACCIONES
  /**
   * Abre la URL de la guía en una nueva pestaña del navegador.
   * * @param {string} url - Dirección web de la guía.
   * * @returns {void}
   */
  abrirGuia(url: string): void {
    if(url) {
      window.open(url, '_blank');
    }
  }
  // #endregion
}