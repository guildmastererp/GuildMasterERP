// #region IMPORTS
import { Component, OnInit } from '@angular/core';
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

  constructor(private http: HttpClient) {}

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

    // Usamos el mismo endpoint del buscador que ya devuelve todos los datos y puntos
    this.http.get<any[]>('http://192.168.1.130:8000/api/aux-personajes', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          // Filtramos para que en el ranking de DKP/puntos solo compitan los Mains
          this.mains = data.filter(p => p.es_main == 1 || p.es_main === true);
          this.ordenarRanking();
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar el ranking:', err);
          this.errorCarga = true;
          this.cargando = false;
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
  }
  // #endregion
}