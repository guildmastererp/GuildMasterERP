import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-inscripcion-eventos',
  templateUrl: './inscripcion.html',
  styleUrls: ['./inscripcion.css'],
  standalone: false
})
export class Inscripcion implements OnInit {
  
  eventosProximos: any[] = [];
  misPersonajes: any[] = [];
  
  // Guardamos qué personaje selecciona el usuario en el desplegable de cada evento
  personajeSeleccionado: { [codigoEvento: string]: string } = {};

  // Variable de estado para bloquear los botones y evitar dobles inscripciones
  procesando: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarMisPersonajes();
    this.cargarEventosProximos();
  }

  private getHeaders() {
    return new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Accept': 'application/json' });
  }

  cargarMisPersonajes() {
    this.http.get<any[]>('http://192.168.1.130:8000/api/mis-personajes', { headers: this.getHeaders() })
      .subscribe(data => {
        this.misPersonajes = data;
      });
  }

  cargarEventosProximos() {
    this.http.get<any[]>('http://192.168.1.130:8000/api/eventos/proximos', { headers: this.getHeaders() })
      .subscribe(data => {
        this.eventosProximos = data;
        
        // Inicializamos los selects con el Main (si lo tiene) o el primer pj
        this.eventosProximos.forEach(e => {
          if (this.misPersonajes.length > 0) {
            const main = this.misPersonajes.find(p => p.es_main);
            this.personajeSeleccionado[e.codigo] = main ? main.codigo : this.misPersonajes[0].codigo;
          }
        });
      });
  }

  // Comprueba si alguno de MIS personajes ya está en la lista de inscritos de este evento
  obtenerMiInscripcion(evento: any): any {
    if (!evento.inscritos || this.misPersonajes.length === 0) return null;
    
    for (let miPj of this.misPersonajes) {
      const inscrito = evento.inscritos.find((i: any) => i.codigo === miPj.codigo);
      if (inscrito) return inscrito; // Devuelve con qué pj estoy apuntado
    }
    return null;
  }

  inscribirse(codigoEvento: string) {
    const codPj = this.personajeSeleccionado[codigoEvento];
    if (!codPj) {
      alert("Selecciona un personaje primero.");
      return;
    }

    this.procesando = true; // Bloqueamos la interfaz

    const body = { codigo_evento: codigoEvento, codigo_personaje: codPj };
    this.http.post('http://192.168.1.130:8000/api/eventos/inscribir', body, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.cargarEventosProximos(); // Recarga la lista para que aparezcas
          this.procesando = false; // Desbloqueamos
        },
        error: () => {
          this.procesando = false; // Desbloqueamos si falla
        }
      });
  }

  desapuntarse(codigoEvento: string, codigoPersonaje: string) {
    this.procesando = true; // Bloqueamos la interfaz

    this.http.delete(`http://192.168.1.130:8000/api/eventos/desinscribir/${codigoEvento}/${codigoPersonaje}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.cargarEventosProximos();
          this.procesando = false; // Desbloqueamos
        },
        error: () => {
          this.procesando = false; // Desbloqueamos si falla
        }
      });
  }
}