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

  // CORRECCIÓN: Inyección de ChangeDetectorRef
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarTodosLosPersonajes();
  }

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
          // CORRECCIÓN: Forzar el repintado de la vista
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorCarga = true;
          this.cargando = false;
          // CORRECCIÓN: Forzar el repintado de la vista
          this.cdr.detectChanges();
        }
      });
  }

  private extraerFiltrosDinamicos() {
    this.reinosDisponibles = [...new Set(this.personajes.map(p => p.reino))].filter(Boolean) as string[];
    this.regionesDisponibles = [...new Set(this.personajes.map(p => p.region))].filter(Boolean) as string[];
    this.specsDisponibles = [...new Set(this.personajes.map(p => p.spec))].filter(Boolean) as string[];
    this.funcionesDisponibles = [...new Set(this.personajes.map(p => p.funcion))].filter(Boolean) as string[];

    // CORRECCIÓN: Extraemos las profesiones de los 4 campos posibles
    const todasLasProfesiones = this.personajes.flatMap(p => [p.profesion1, p.profesion2, p.profesion_sec1, p.profesion_sec2]);
    this.profesionesDisponibles = [...new Set(todasLasProfesiones)].filter(Boolean) as string[];
  }

  get personajesFiltrados(): any[] {
    if (!this.personajes) return [];

    return this.personajes.filter(p => {
      const coincideNombre = p.nombre ? p.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase()) : false;
      const coincideReino = this.filtroReino ? p.reino === this.filtroReino : true;
      const coincideRegion = this.filtroRegion ? p.region === this.filtroRegion : true;
      const coincideSpec = this.filtroSpec ? p.spec === this.filtroSpec : true;
      const coincideFuncion = this.filtroFuncion ? p.funcion === this.filtroFuncion : true;
      
      // CORRECCIÓN: Comprobamos si la profesión buscada está en alguno de los 4 slots del personaje
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

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroReino = '';
    this.filtroRegion = '';
    this.filtroSpec = '';
    this.filtroProfesion = '';
    this.filtroFuncion = '';
    this.cdr.detectChanges();
  }
}