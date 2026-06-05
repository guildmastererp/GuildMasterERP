import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-roster',
  templateUrl: './roster.html',
  styleUrls: ['./roster.css'],
  standalone: false
})
export class Roster implements OnInit {

  esAdmin: boolean = false;
  cargandoRol: boolean = true;
  procesando: boolean = false;

  rosterActual: any[] = [];
  todosPersonajes: any[] = [];
  terminoBusqueda: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.comprobarRol();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    });
  }

  // 1. COMPROBAR SEGURIDAD
  comprobarRol() {
    this.http.get<any>('http://192.168.1.130:8000/api/user', { headers: this.getHeaders() })
      .subscribe({
        next: (user) => {
          this.cargandoRol = false;
          if (user.codigo_rol === '0001' || user.codigo_rol === '0002') {
            this.esAdmin = true;
            this.cargarDatos();
          }
        },
        error: () => this.cargandoRol = false
      });
  }

  // 2. CARGAR TODOS LOS DATOS
  cargarDatos() {
    this.cargarRoster();
    this.cargarPersonajesParaBuscador();
  }

  cargarRoster() {
    this.http.get<any[]>('http://192.168.1.130:8000/api/roster', { headers: this.getHeaders() })
      .subscribe(data => this.rosterActual = data);
  }

  cargarPersonajesParaBuscador() {
    // Reutilizamos el endpoint del buscador general
    this.http.get<any[]>('http://192.168.1.130:8000/api/aux-personajes', { headers: this.getHeaders() })
      .subscribe(data => this.todosPersonajes = data);
  }

  // 3. LÓGICA DEL BUSCADOR (Filtra a los que ya están en el roster)
  get resultadosBuscador() {
    if (!this.terminoBusqueda) return [];

    const codigosEnRoster = this.rosterActual.map(r => r.codigo);
    const disponibles = this.todosPersonajes.filter(p => !codigosEnRoster.includes(p.codigo));

    return disponibles.filter(p => 
      p.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) || 
      p.clase.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
      p.funcion.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
    );
  }

  // 4. ACCIONES DEL ROSTER
  agregarAlRoster(personaje: any) {
    this.procesando = true;
    this.http.post('http://192.168.1.130:8000/api/roster/add', { codigoPersonaje: personaje.codigo }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.terminoBusqueda = ''; // Limpiamos buscador
          this.cargarRoster(); // Refrescamos lista
          this.procesando = false;
        },
        error: () => this.procesando = false
      });
  }

  expulsarDelRoster(personaje: any) {
    if (confirm(`¿Estás seguro de sacar a ${personaje.nombre} del roster?`)) {
      this.procesando = true;
      this.http.delete(`http://192.168.1.130:8000/api/roster/remove/${personaje.codigo}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.cargarRoster();
            this.procesando = false;
          },
          error: () => this.procesando = false
        });
    }
  }

}