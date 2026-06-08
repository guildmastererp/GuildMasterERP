// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// #endregion

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.html',
  styleUrls: ['./ranking.css'],
  standalone: false
})
export class Ranking implements OnInit {

  // #region PROPIEDADES
  mains: any[] = [];
  cargando: boolean = true;
  errorCarga: boolean = false;
  
  // Por defecto el que más puntos tiene va primero
  ordenDescendente: boolean = true; 
  // #endregion

  // CORRECCIÓN: Inyección de ChangeDetectorRef
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarRanking();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    });
  }

  // #region CARGA Y LÓGICA DE DATOS
  cargarRanking() {
    this.cargando = true;
    this.errorCarga = false;

    this.http.get<any[]>('http://192.168.1.130:8000/api/aux-personajes', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.mains = data.filter(p => p.es_main == 1 || p.es_main === true);
          this.ordenarRanking();
          this.cargando = false;
          // CORRECCIÓN: Forzar el repintado de la vista
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar el ranking:', err);
          this.errorCarga = true;
          this.cargando = false;
          // CORRECCIÓN: Forzar el repintado de la vista
          this.cdr.detectChanges();
        }
      });
  }

  invertirOrden() {
    this.ordenDescendente = !this.ordenDescendente;
    this.ordenarRanking();
  }

  ordenarRanking() {
    this.mains.sort((a, b) => {
      if (this.ordenDescendente) {
        return b.puntos - a.puntos; // De mayor a menor
      } else {
        return a.puntos - b.puntos; // De menor a mayor
      }
    });
    // CORRECCIÓN: Al reordenar localmente, no viene mal refrescar la vista
    this.cdr.detectChanges();
  }
  // #endregion
}