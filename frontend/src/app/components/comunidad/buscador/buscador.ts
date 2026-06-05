// #region IMPORTS
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// #endregion

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.html',
  styleUrls: ['./buscador.css'],
  standalone: false
})
export class Buscador implements OnInit {

  // #region PROPIEDADES DE DATOS
  personajes: any[] = [];
  cargando: boolean = true;
  errorCarga: boolean = false;
  // #endregion

  // #region PROPIEDADES DE FILTRADO
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
  constructor(private http: HttpClient) {}
  // #endregion

  // #region HOOKS
  ngOnInit(): void {
    this.cargarTodosLosPersonajes();
  }
  // #endregion

  // #region MÉTODOS DE DATOS
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  cargarTodosLosPersonajes() {
    this.cargando = true;
    this.errorCarga = false;

    this.http.get<any[]>('http://192.168.1.132:8000/api/aux-personajes', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.personajes = data;
          this.extraerFiltrosDinamicos();
          this.cargando = false;
        },
        error: (err) => {
          console.error(err);
          this.errorCarga = true;
          this.cargando = false;
        }
      });
  }
  // #endregion

  // #region MÉTODOS DE FILTRADO
  private extraerFiltrosDinamicos() {
    this.reinosDisponibles = [...new Set(this.personajes.map(p => p.reino))].filter(Boolean) as string[];
    this.regionesDisponibles = [...new Set(this.personajes.map(p => p.region))].filter(Boolean) as string[];
    this.specsDisponibles = [...new Set(this.personajes.map(p => p.spec))].filter(Boolean) as string[];
    this.profesionesDisponibles = [...new Set(this.personajes.map(p => p.profesion))].filter(Boolean) as string[];
    this.funcionesDisponibles = [...new Set(this.personajes.map(p => p.funcion))].filter(Boolean) as string[];
  }

  get personajesFiltrados(): any[] {
    if (!this.personajes) return [];

    return this.personajes.filter(p => {
      const coincideNombre = p.nombre ? p.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase()) : false;
      const coincideReino = this.filtroReino ? p.reino === this.filtroReino : true;
      const coincideRegion = this.filtroRegion ? p.region === this.filtroRegion : true;
      const coincideSpec = this.filtroSpec ? p.spec === this.filtroSpec : true;
      const coincideProfesion = this.filtroProfesion ? p.profesion === this.filtroProfesion : true;
      const coincideFuncion = this.filtroFuncion ? p.funcion === this.filtroFuncion : true;

      return coincideNombre && coincideReino && coincideRegion && coincideSpec && coincideProfesion && coincideFuncion;
    });
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroReino = '';
    this.filtroRegion = '';
    this.filtroSpec = '';
    this.filtroProfesion = '';
    this.filtroFuncion = '';
  }
  // #endregion
}