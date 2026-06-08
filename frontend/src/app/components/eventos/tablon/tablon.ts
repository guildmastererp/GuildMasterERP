import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-tablon',
  templateUrl: './tablon.html',
  styleUrls: ['./tablon.css'],
  standalone: false
})
export class Tablon implements OnInit {

  // #region PROPIEDADES BÁSICAS Y CALENDARIO
  esAdmin: boolean = false;
  fechaActual: Date = new Date();
  mesNombre: string = '';
  anioActual: number = 0;
  diasSemanas: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  calendarioDias: any[] = [];
  // #endregion

  // #region DATOS DEL BACKEND
  eventos: any[] = []; 
  tipos: any[] = []; 
  // #endregion

  // #region PROPIEDADES DE MODALES
  modalAbierta: boolean = false;
  eventoSeleccionado: any = null;

  modalCrearAbierta: boolean = false;
  nuevoEvento: any = { titulo: '', descripcion: '', fecha_evento: '', codigoTipo: '' };
  // #endregion

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.comprobarRol();
    this.cargarTipos();
    this.cargarDatos(); 
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    });
  }

  comprobarRol() {
    this.http.get<any>('http://192.168.1.130:8000/api/user', { headers: this.getHeaders() })
      .subscribe({
        next: (user) => {
          this.esAdmin = (user.codigo_rol === '0001' || user.codigo_rol === '0002');
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }

  // #region CARGA DE DATOS
  cargarTipos() {
    this.http.get<any[]>('http://192.168.1.130:8000/api/eventos/tipos', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.tipos = data;
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }

  cargarDatos() {
    this.http.get<any[]>('http://192.168.1.130:8000/api/eventos', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.eventos = data;
          this.generarCalendario(); 
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }
  // #endregion

  // #region LÓGICA DEL CALENDARIO
  cambiarMes(offset: number) {
    this.fechaActual.setMonth(this.fechaActual.getMonth() + offset);
    this.generarCalendario();
  }

  generarCalendario() {
    this.calendarioDias = [];
    const anio = this.fechaActual.getFullYear();
    const mes = this.fechaActual.getMonth();

    this.anioActual = anio;
    this.mesNombre = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(this.fechaActual);

    let primerDia = new Date(anio, mes, 1).getDay();
    primerDia = primerDia === 0 ? 6 : primerDia - 1; 

    const diasEnElMes = new Date(anio, mes + 1, 0).getDate();

    for (let i = 0; i < primerDia; i++) {
      this.calendarioDias.push({ dia: null, eventos: [] });
    }

    for (let i = 1; i <= diasEnElMes; i++) {
      const fechaStr = `${anio}-${(mes + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const eventosDelDia = this.eventos.filter(e => e.fecha_evento.startsWith(fechaStr));

      this.calendarioDias.push({
        dia: i,
        fechaCompleta: fechaStr,
        eventos: eventosDelDia,
        esHoy: this.comprobarSiEsHoy(anio, mes, i)
      });
    }
    this.cdr.detectChanges();
  }

  comprobarSiEsHoy(anio: number, mes: number, dia: number): boolean {
    const hoy = new Date();
    return hoy.getDate() === dia && hoy.getMonth() === mes && hoy.getFullYear() === anio;
  }
  // #endregion

  // #region LÓGICA MODAL INFO Y ELIMINAR
  abrirModal(evento: any) {
    if (evento) {
      this.eventoSeleccionado = evento;
      this.modalAbierta = true;
      this.cdr.detectChanges();
    }
  }

  cerrarModal() {
    this.modalAbierta = false;
    this.eventoSeleccionado = null;
    this.cdr.detectChanges();
  }

  eliminarEvento() {
    if (confirm('¿Estás seguro de que deseas cancelar este evento?')) {
      this.http.delete(`http://192.168.1.130:8000/api/eventos/remove/${this.eventoSeleccionado.id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.cerrarModal();
            this.cargarDatos(); 
          },
          error: () => this.cdr.detectChanges()
        });
    }
  }
  // #endregion

  // #region LÓGICA MODAL CREAR
  abrirModalCrear() {
    this.nuevoEvento = { titulo: '', descripcion: '', fecha_evento: '', codigoTipo: this.tipos[0]?.codigo || '' };
    this.modalCrearAbierta = true;
    this.cdr.detectChanges();
  }

  cerrarModalCrear() {
    this.modalCrearAbierta = false;
    this.cdr.detectChanges();
  }

  guardarEvento() {
    if (!this.nuevoEvento.fecha_evento || !this.nuevoEvento.titulo) {
      alert('Debes indicar un título y una fecha.');
      return;
    }
    
    this.http.post('http://192.168.1.130:8000/api/eventos/add', this.nuevoEvento, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.cerrarModalCrear();
          this.cargarDatos(); 
        },
        error: () => this.cdr.detectChanges()
      });
  }
  // #endregion
}