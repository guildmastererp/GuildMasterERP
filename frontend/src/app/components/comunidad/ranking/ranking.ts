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
  ordenDescendente: boolean = true; 
  // #endregion

  // #region CONSTRUCTOR
  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef
  ) {}
  // #endregion

  // #region MÉTODOS

  /**
   * Ciclo de vida de inicialización del componente.
   * Dispara la carga automática del ranking de personajes al momento 
   * de montar la vista.
   * * @returns {void}
   */
  ngOnInit(): void {
    this.cargarRanking();
  }

  /**
   * Construye y devuelve las cabeceras HTTP necesarias para la autorización.
   * Recupera el token de Sanctum almacenado localmente para permitir el acceso 
   * a las rutas protegidas del backend.
   * * @private
   * * @returns {HttpHeaders}
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    });
  }

  /**
   * Obtiene la lista completa de personajes auxiliares desde la API.
   * Filtra los resultados para quedarse únicamente con los personajes principales 
   * (mains), los ordena según la configuración actual y fuerza la actualización 
   * del árbol de componentes de Angular.
   * * @returns {void}
   */
  cargarRanking(): void {
    this.cargando = true;
    this.errorCarga = false;

    this.http.get<any[]>('http://192.168.1.130:8000/api/aux-personajes', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.mains = data.filter(p => p.es_main == 1 || p.es_main === true);
          this.ordenarRanking();
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar el ranking:', err);
          this.errorCarga = true;
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Invierte dinámicamente el orden de visualización de la tabla.
   * Cambia el estado del orden (de mayor a menor o viceversa) y vuelve 
   * a ejecutar la función de ordenamiento local.
   * * @returns {void}
   */
  invertirOrden(): void {
    this.ordenDescendente = !this.ordenDescendente;
    this.ordenarRanking();
  }

  /**
   * Ordena localmente el array de personajes principales basándose en los puntos.
   * Respeta la dirección establecida por la propiedad 'ordenDescendente' y 
   * fuerza la detección de cambios para reflejar el nuevo orden en la interfaz.
   * * @returns {void}
   */
  ordenarRanking(): void {
    this.mains.sort((a, b) => {
      if (this.ordenDescendente) {
        return b.puntos - a.puntos; // De mayor a menor
      } else {
        return a.puntos - b.puntos; // De menor a mayor
      }
    });
    this.cdr.detectChanges();
  }

  // #endregion
}