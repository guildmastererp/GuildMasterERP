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

  // #region PROPIEDADES 
  esAdmin: boolean = false;
  fechaActual: Date = new Date();
  mesNombre: string = '';
  anioActual: number = 0;
  diasSemanas: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  calendarioDias: any[] = [];

  eventosRaid: any[] = [
    { id: 1, fecha: '2026-06-10', nombre: 'The Dreamrift', dificultad: 'Heroico' },
    { id: 2, fecha: '2026-06-11', nombre: 'The Dreamrift', dificultad: 'Heroico' },
    { id: 3, fecha: '2026-06-15', nombre: 'The Voidspire', dificultad: 'Mítico' },
    { id: 4, fecha: '2026-06-17', nombre: 'March on Quel\'Danas', dificultad: 'Normal' }
  ];

  rosterActual: any[] = [];
  totalTanques: number = 0;
  totalHealers: number = 0;
  totalDPS: number = 0;

  modalAbierta: boolean = false;
  raidSeleccionada: any = null;

  modalCrearAbierta: boolean = false;
  nuevaRaid: any = { fecha: '', nombre: 'The Dreamrift', dificultad: 'Normal' };
  // #endregion

  // #region CONSTRUCTOR
  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef
  ) {}
  // #endregion

  // #region CICLO DE VIDA
  /**
   * Inicializa la vista comprobando permisos, generando el calendario
   * y cargando el roster actual.
   */
  ngOnInit(): void {
    this.comprobarRol();
    this.generarCalendario();
    this.cargarRoster();
  }
  // #endregion

  // #region SEGURIDAD Y ROLES
  /**
   * Genera las cabeceras HTTP necesarias para las peticiones autenticadas.
   * @private
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    });
  }

  /**
   * Verifica el rol del usuario para determinar si tiene acceso de administrador.
   */
  comprobarRol(): void {
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
  /**
   * Carga el roster actual desde el backend y recalcula los roles.
   */
  cargarRoster(): void {
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

  /**
   * Calcula el total de tanques, healers y dps para la vista de organización.
   */
  calcularComposicion(): void {
    this.totalTanques = this.rosterActual.filter(j => j.funcion === 'Tanque').length;
    this.totalHealers = this.rosterActual.filter(j => j.funcion === 'Healer').length;
    this.totalDPS = this.rosterActual.filter(j => j.funcion === 'DPS').length;
  }
  // #endregion

  // #region LÓGICA DEL CALENDARIO
  /**
   * Avanza o retrocede en el calendario.
   * @param offset Número de meses a sumar o restar.
   */
  cambiarMes(offset: number): void {
    this.fechaActual.setMonth(this.fechaActual.getMonth() + offset);
    this.generarCalendario();
  }

  /**
   * Genera la matriz de días para el calendario actual.
   * Calcula los días vacíos iniciales y asigna los eventos correspondientes a cada día.
   */
  generarCalendario(): void {
    this.calendarioDias = [];
    const anio = this.fechaActual.getFullYear();
    const mes = this.fechaActual.getMonth();

    this.anioActual = anio;
    this.mesNombre = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(this.fechaActual);

    let primerDia = new Date(anio, mes, 1).getDay();
    primerDia = primerDia === 0 ? 6 : primerDia - 1; 

    const diasEnElMes = new Date(anio, mes + 1, 0).getDate();

    // Rellenar días vacíos al inicio del mes
    for (let i = 0; i < primerDia; i++) {
      this.calendarioDias.push({ dia: null, evento: null });
    }

    // Rellenar días del mes
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

  /**
   * Comprueba si una fecha es el día actual.
   */
  comprobarSiEsHoy(anio: number, mes: number, dia: number): boolean {
    const hoy = new Date();
    return hoy.getDate() === dia && hoy.getMonth() === mes && hoy.getFullYear() === anio;
  }
  // #endregion

  // #region MODALES 
  /**
   * Abre el modal de detalle para una raid específica.
   */
  abrirModal(evento: any): void {
    if (evento) {
      this.raidSeleccionada = evento;
      this.modalAbierta = true;
      this.cdr.detectChanges();
    }
  }

  cerrarModal(): void {
    this.modalAbierta = false;
    this.raidSeleccionada = null;
    this.cdr.detectChanges();
  }

  /**
   * Elimina la raid seleccionada de la lista de eventos.
   */
  eliminarRaid(): void {
    this.eventosRaid = this.eventosRaid.filter(r => r.id !== this.raidSeleccionada.id);
    this.cerrarModal();
    this.generarCalendario();
  }

  abrirModalCrear(): void {
    const hoy = new Date();
    const fechaStr = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
    
    this.nuevaRaid = { fecha: fechaStr, nombre: 'The Dreamrift', dificultad: 'Normal' };
    this.modalCrearAbierta = true;
    this.cdr.detectChanges();
  }

  cerrarModalCrear(): void {
    this.modalCrearAbierta = false;
    this.cdr.detectChanges();
  }

  /**
   * Añade una nueva raid a la lista de eventos.
   */
  guardarRaid(): void {
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