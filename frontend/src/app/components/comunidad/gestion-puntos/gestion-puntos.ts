// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
// #endregion

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

  auxClases: any[] = [];
  auxSpecs: any[] = [];
  auxFunciones: any[] = [];
  profesionesPrincipales: any[] = [];
  profesionesSecundarias: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarDatosAuxiliares();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  cargarDatosAuxiliares() {
    this.cargando = true;
    forkJoin({
      clases: this.http.get<any[]>('http://192.168.1.130:8000/api/aux-clases', { headers: this.getHeaders() }),
      specs: this.http.get<any[]>('http://192.168.1.130:8000/api/aux-specs', { headers: this.getHeaders() }),
      profesiones: this.http.get<any[]>('http://192.168.1.130:8000/api/aux-profesiones', { headers: this.getHeaders() }),
      funciones: this.http.get<any[]>('http://192.168.1.130:8000/api/aux-funciones', { headers: this.getHeaders() })
    }).subscribe({
      next: (res) => {
        this.auxClases = res.clases;
        this.auxSpecs = res.specs;
        this.auxFunciones = res.funciones;
        this.profesionesPrincipales = res.profesiones.filter(p => p.nivel === 'Principal');
        this.profesionesSecundarias = res.profesiones.filter(p => p.nivel === 'Secundaria');
        this.cargarPersonajes();
      },
      error: () => {
        alert('Error al cargar datos auxiliares.');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarPersonajes() {
    this.http.get<any[]>('http://192.168.1.130:8000/api/aux-personajes', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.personajes = data.map(p => ({ ...p, puntosInput: 0 }));
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar personajes', err);
          this.cargando = false;
          this.cdr.detectChanges();
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

  getSpecsDeClase(claseNombre: string) {
    const claseObj = this.auxClases.find(c => c.nombre === claseNombre);
    return claseObj ? this.auxSpecs.filter(s => s.codigoClase === claseObj.codigo) : [];
  }

  onClaseChange(p: any) {
    p.spec = ''; 
    this.guardarConfiguracion(p);
  }

  guardarConfiguracion(p: any) {
    const claseObj = this.auxClases.find(c => c.nombre === p.clase);
    const specObj = this.auxSpecs.find(s => s.nombre === p.spec && s.codigoClase === claseObj?.codigo);
    p.funcion = this.auxFunciones.find(f => f.codigo === specObj?.codigoFuncion)?.nombre || '';

    const payload = {
      codigo: p.codigo,
      clase: p.clase || '',
      spec: p.spec || '',
      funcion: p.funcion,
      profesion1: p.profesion1 || '',
      profesion2: p.profesion2 || '',
      profesion_sec1: p.profesion_sec1 || '',
      profesion_sec2: p.profesion_sec2 || ''
    };

    this.http.post('http://192.168.1.130:8000/api/actualizar-configuracion-oficial', payload, { headers: this.getHeaders() })
      .subscribe({
        error: () => alert(`Fallo al guardar los datos de ${p.nombre}.`)
      });
  }

  otorgarPuntos(personaje: any) {
    if (!personaje.puntosInput || personaje.puntosInput === 0) return;

    this.procesando = true;
    const payload = { codigo: personaje.codigo, cantidad: personaje.puntosInput };

    this.http.post('http://192.168.1.130:8000/api/actualizar-puntos', payload, { headers: this.getHeaders() })
      .subscribe({
        next: (res: any) => {
          personaje.puntos = res.nuevosPuntos;
          personaje.puntosInput = 0; 
          this.procesando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.procesando = false;
          alert('Hubo un error al actualizar los puntos.');
          this.cdr.detectChanges();
        }
      });
  }
}