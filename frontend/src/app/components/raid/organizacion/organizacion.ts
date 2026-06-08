// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// #endregion

@Component({
  selector: 'app-organizacion',
  templateUrl: './organizacion.html',
  styleUrls: ['./organizacion.css'],
  standalone: false
})
export class Organizacion implements OnInit {

  // #region PROPIEDADES BÁSICAS
  esAdmin: boolean = false;
  fechaActual: Date = new Date();
  mesNombre: string = '';
  anioActual: number = 0;
  diasSemanas: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  calendarioDias: any[] = [];
  // #endregion

  // #region DATOS DEL EVENTO (Estos son los días marcados en el calendario)
  eventosRaid: any[] = [
    { id: 1, fecha: '2026-06-10', nombre: 'The Dreamrift', dificultad: 'Heroico' },
    { id: 2, fecha: '2026-06-11', nombre: 'The Dreamrift', dificultad: 'Heroico' },
    { id: 3, array: '2026-06-15', nombre: 'The Voidspire', dificultad: 'Mítico' },
    { id: 4, fecha: '2026-06-17', nombre: 'March on Quel\'Danas', dificultad: 'Normal' }
  ];
  // #endregion

  // #region PROPIEDADES DEL ROSTER REAL
  rosterActual: any[] = [];
  totalTanques: number = 0;
  totalHealers: number = 0;
  totalDPS: number = 0;
  // #endregion

  // #region PROPIEDADES DE LAS MODALES
  modalAbierta: boolean = false;
  raidSeleccionada: any = null;

  modalCrearAbierta: boolean = false;
  nuevaRaid: any = { fecha: '', nombre: 'The Dreamrift', dificultad: 'Normal' };
  // #endregion

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.comprobarRol();
    this.generarCalendario();
    this.cargarRoster();
  }

  // #region SEGURIDAD Y ROLES
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
          if (user.codigo_rol === '0001' || user.codigo_rol === '0002') {
            this.esAdmin = true;
          }
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }
  // #endregion

  // #region LÓGICA DEL ROSTER
  cargarRoster() {
    this.http.get<any[]>('http://192.168.1.130:8000/api/roster', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.rosterActual = data;
          this.calcularComposicion();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar el roster de la BD', err);
          this.cdr.detectChanges();
        }
      });
  }

  calcularComposicion() {
    this.totalTanques = this.rosterActual.filter(j => j.funcion === 'Tanque').length;
    this.totalHealers = this.rosterActual.filter(j => j.funcion === 'Healer').length;
    this.totalDPS = this.rosterActual.filter(j => j.funcion === 'DPS').length;
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
      this.calendarioDias.push({ dia: null, evento: null });
    }

    for (let i = 1; i <= diasEnElMes; i++) {
      const fechaStr = `${anio}-${(mes + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const raidDelDia = this.eventosRaid.find(r => r.fecha === fechaStr);

      this.calendarioDias.push({
        dia: i,
        fechaCompleta: fechaStr,
        evento: raidDelDia || null,
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
      this.raidSeleccionada = evento;
      this.modalAbierta = true;
      this.cdr.detectChanges();
    }
  }

  cerrarModal() {
    this.modalAbierta = false;
    this.raidSeleccionada = null;
    this.cdr.detectChanges();
  }

  eliminarRaid() {
    const confirmacion = confirm('¿Estás seguro de que deseas cancelar esta raid?');
    if (confirmacion) {
      this.eventosRaid = this.eventosRaid.filter(r => r.id !== this.raidSeleccionada.id);
      this.cerrarModal();
      this.generarCalendario();
    }
  }
  // #endregion

  // #region LÓGICA MODAL CREAR
  abrirModalCrear() {
    const hoy = new Date();
    const fechaStr = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
    
    this.nuevaRaid = { fecha: fechaStr, nombre: 'The Dreamrift', dificultad: 'Normal' };
    this.modalCrearAbierta = true;
    this.cdr.detectChanges();
  }

  cerrarModalCrear() {
    this.modalCrearAbierta = false;
    this.cdr.detectChanges();
  }

  guardarRaid() {
    if (!this.nuevaRaid.fecha) {
      alert('Debes seleccionar una fecha.');
      return;
    }
    
    this.nuevaRaid.id = Math.floor(Math.random() * 1000);
    this.eventosRaid.push({...this.nuevaRaid});
    
    this.cerrarModalCrear();
    this.generarCalendario();
  }
  // #endregion
}