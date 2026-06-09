import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';

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
    this.cargarDatosIniciales(); 
  }

  private getHeaders() {
    return new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Accept': 'application/json' });
  }

  cargarDatosIniciales() {
    const peticionPersonajes = this.http.get<any[]>('http://192.168.1.130:8000/api/mis-personajes', { headers: this.getHeaders() });
    const peticionEventos = this.http.get<any[]>('http://192.168.1.130:8000/api/eventos/proximos', { headers: this.getHeaders() });

    forkJoin({
      personajes: peticionPersonajes,
      eventos: peticionEventos
    }).subscribe({
      next: (res) => {
        this.misPersonajes = res.personajes;
        
        // Formateamos los eventos antes de dárselos al HTML
        this.eventosProximos = res.eventos.map((e: any) => {
          // 1. Arreglamos la fecha de Laravel (espacio por T) para que Angular no falle
          if (e.fecha_evento) {
            e.fecha_evento_limpia = e.fecha_evento.replace(' ', 'T');
          }
          // 2. Pre-calculamos la inscripción para no saturar el HTML
          e.miInscripcion = this.obtenerInscripcionLocal(e, this.misPersonajes);
          return e;
        });
        
        this.eventosProximos.forEach(e => {
          if (this.misPersonajes.length > 0) {
            const main = this.misPersonajes.find(p => p.es_main == 1 || p.es_main === true);
            this.personajeSeleccionado[e.codigo] = main ? main.codigo : this.misPersonajes[0].codigo;
          }
        });
        
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  cargarEventosProximos() {
    this.http.get<any[]>('http://192.168.1.130:8000/api/eventos/proximos', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.eventosProximos = data.map((e: any) => {
            if (e.fecha_evento) e.fecha_evento_limpia = e.fecha_evento.replace(' ', 'T');
            e.miInscripcion = this.obtenerInscripcionLocal(e, this.misPersonajes);
            return e;
          });
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }

  // Método auxiliar interno que no llamamos desde el HTML
  private obtenerInscripcionLocal(evento: any, misPjs: any[]): any {
    if (!evento.inscritos || misPjs.length === 0) return null;
    for (let miPj of misPjs) {
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
        },
        error: () => {
          this.procesando = false; 
          this.cdr.detectChanges();
        }
      });
  }
}