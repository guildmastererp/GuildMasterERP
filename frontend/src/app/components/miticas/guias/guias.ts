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
  // #endregion

  // #region PROPIEDADES DE FILTRO
  filtroBusqueda: string = '';
  filtroExpansion: string = '';
  filtroTemporada: string = '';
  // #endregion

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarDatosMaestros();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  // #region CARGA Y AGRUPACIÓN DE DATOS
  cargarDatosMaestros() {
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

  cargarGuias() {
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

  agruparDatos(guiasRaw: any[]) {
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
  get temporadasFiltradas() { 
    return this.temporadasDisponibles.filter(t => t.codigoExpa == this.filtroExpansion); 
  }

  aplicarFiltros() {
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

  limpiarFiltros() {
    this.filtroExpansion = '';
    this.filtroTemporada = '';
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }
  // #endregion

  // #region ACCIONES
  abrirGuia(url: string) {
    if(url) {
      window.open(url, '_blank');
    }
  }
  // #endregion
}