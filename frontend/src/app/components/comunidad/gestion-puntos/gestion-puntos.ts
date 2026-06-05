import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-gestion-puntos',
  templateUrl: './gestion-puntos.html',
  styleUrls: ['./gestion-puntos.css'],
  standalone: false
})
export class GestionPuntos implements OnInit {

  personajes: any[] = [];
  terminoBusqueda: string = '';
  cargando: boolean = true;
  procesando: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPersonajes();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    });
  }

  cargarPersonajes() {
    this.cargando = true;
    this.http.get<any[]>('http://192.168.1.130:8000/api/aux-personajes', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          // Inicializamos una variable local en cada personaje para el input numérico
          this.personajes = data.map(p => ({ ...p, puntosInput: 0 }));
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar personajes', err);
          this.cargando = false;
        }
      });
  }

  get personajesFiltrados() {
    if (!this.terminoBusqueda) return this.personajes;
    return this.personajes.filter(p => 
      p.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) || 
      (p.reino && p.reino.toLowerCase().includes(this.terminoBusqueda.toLowerCase()))
    );
  }

  otorgarPuntos(personaje: any) {
    if (!personaje.puntosInput || personaje.puntosInput === 0) return;

    this.procesando = true;
    const payload = {
      codigo: personaje.codigo,
      cantidad: personaje.puntosInput
    };

    this.http.post('http://192.168.1.130:8000/api/actualizar-puntos', payload, { headers: this.getHeaders() })
      .subscribe({
        next: (res: any) => {
          // Actualizamos visualmente el personaje sin recargar la página entera
          personaje.puntos = res.nuevosPuntos;
          personaje.puntosInput = 0; // Reseteamos el input
          this.procesando = false;
          alert(`Puntos actualizados. Nuevo total de ${personaje.nombre}: ${personaje.puntos}`);
        },
        error: (err) => {
          this.procesando = false;
          alert('Hubo un error al actualizar los puntos. ¿Tienes rango de Oficial?');
        }
      });
  }
}