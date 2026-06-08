import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  
  personajeSeleccionado: { [codigoEvento: string]: string } = {};
  procesando: boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarMisPersonajes();
    this.cargarEventosProximos();
  }

  private getHeaders() {
    return new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Accept': 'application/json' });
  }

  cargarMisPersonajes() {
    this.http.get<any[]>('http://192.168.1.130:8000/api/mis-personajes', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.misPersonajes = data;
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }

  cargarEventosProximos() {
    this.http.get<any[]>('http://192.168.1.130:8000/api/eventos/proximos', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.eventosProximos = data;
          
          this.eventosProximos.forEach(e => {
            if (this.misPersonajes.length > 0) {
              const main = this.misPersonajes.find(p => p.es_main);
              this.personajeSeleccionado[e.codigo] = main ? main.codigo : this.misPersonajes[0].codigo;
            }
          });
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }

  obtenerMiInscripcion(evento: any): any {
    if (!evento.inscritos || this.misPersonajes.length === 0) return null;
    
    for (let miPj of this.misPersonajes) {
      const inscrito = evento.inscritos.find((i: any) => i.codigo === miPj.codigo);
      if (inscrito) return inscrito; 
    }
    return null;
  }

  inscribirse(codigoEvento: string) {
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
          this.cdr.detectChanges();
        },
        error: () => {
          this.procesando = false; 
          this.cdr.detectChanges();
        }
      });
  }

  desapuntarse(codigoEvento: string, codigoPersonaje: string) {
    this.procesando = true; 

    this.http.delete(`http://192.168.1.130:8000/api/eventos/desinscribir/${codigoEvento}/${codigoPersonaje}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.cargarEventosProximos();
          this.procesando = false; 
          this.cdr.detectChanges();
        },
        error: () => {
          this.procesando = false; 
          this.cdr.detectChanges();
        }
      });
  }
}