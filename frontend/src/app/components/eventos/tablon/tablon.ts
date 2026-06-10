// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// #endregion

@Component({
  selector: 'app-tablon',
  templateUrl: './tablon.html',
  styleUrls: ['./tablon.css'],
  standalone: false
})
export class Tablon implements OnInit {

  // #region PROPIEDADES: ESTADO Y CALENDARIO
  esAdmin: boolean = false;
  fechaActual: Date = new Date();
  mesNombre: string = '';
  anioActual: number = 0;
  diasSemanas: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  calendarioDias: any[] = [];

  eventos: any[] = []; 
  tipos: any[] = []; 

  modalAbierta: boolean = false;
  eventoSeleccionado: any = null;

  modalCrearAbierta: boolean = false;
  nuevoEvento: any = { titulo: '', descripcion: '', fecha_evento: '', codigoTipo: '' };
  // #endregion

  // #region CONSTRUCTOR
  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef
  ) {}
  // #endregion

  // #region CICLO DE VIDA
  /**
   * Ciclo de vida de inicialización.
   * Verifica los permisos del usuario, carga las categorías de eventos 
   * y obtiene el listado general de eventos para renderizar el calendario.
   * * @returns {void}
   */
  ngOnInit(): void {
    this.comprobarRol();
    this.cargarTipos();
    this.cargarDatos(); 
  }
  // #endregion

  // #region UTILIDADES
  /**
   * Construye las cabeceras HTTP de autorización.
   * * @private
   * @returns {HttpHeaders}
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    });
  }

  /**
   * Verifica el rol del usuario autenticado para determinar si tiene
   * privilegios de administrador (códigos 0001 o 0002).
   * * @returns {void}
   */
  comprobarRol(): void {
    this.http.get<any>('http://192.168.1.130:8000/api/user', { headers: this.getHeaders() })
      .subscribe({
        next: (user) => {
          this.esAdmin = (user.codigo_rol === '0001' || user.codigo_rol === '0002');
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }
  // #endregion

  // #region CARGA DE DATOS
  /**
   * Obtiene los tipos de eventos disponibles en el servidor para el formulario de creación.
   * * @returns {void}
   */
  cargarTipos(): void {
    this.http.get<any[]>('http://192.168.1.130:8000/api/eventos/tipos', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.tipos = data;
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }

  /**
   * Recupera todos los eventos programados y dispara la generación de la matriz del calendario.
   * * @returns {void}
   */
  cargarDatos(): void {
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
  /**
   * Ajusta el mes actual basado en un desplazamiento (offset) y regenera la vista.
   * * @param {number} offset - Cantidad de meses a avanzar o retroceder.
   * * @returns {void}
   */
  cambiarMes(offset: number): void {
    this.fechaActual.setMonth(this.fechaActual.getMonth() + offset);
    this.generarCalendario();
  }

  /**
   * Calcula y construye la estructura de datos que representa el calendario mensual.
   * Gestiona el padding inicial (días del mes anterior) y filtra los eventos por fecha.
   * * @returns {void}
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

  /**
   * Comprueba si la fecha pasada como argumento corresponde al día actual del sistema.
   * * @returns {boolean}
   */
  comprobarSiEsHoy(anio: number, mes: number, dia: number): boolean {
    const hoy = new Date();
    return hoy.getDate() === dia && hoy.getMonth() === mes && hoy.getFullYear() === anio;
  }
  // #endregion

  // #region LÓGICA MODAL INFO Y ELIMINAR
  /**
   * Abre el modal de información para un evento específico.
   * * @param {any} evento - El evento seleccionado.
   * * @returns {void}
   */
  abrirModal(evento: any): void {
    if (evento) {
      this.eventoSeleccionado = evento;
      this.modalAbierta = true;
      this.cdr.detectChanges();
    }
  }

  /**
   * Cierra el modal de información y resetea el evento seleccionado.
   * * @returns {void}
   */
  cerrarModal(): void {
    this.modalAbierta = false;
    this.eventoSeleccionado = null;
    this.cdr.detectChanges();
  }

  /**
   * Elimina un evento de la base de datos tras confirmación del usuario.
   * * @returns {void}
   */
  eliminarEvento(): void {
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
  /**
   * Inicializa el objeto de nuevo evento y abre el modal de creación.
   * * @returns {void}
   */
  abrirModalCrear(): void {
    this.nuevoEvento = { titulo: '', descripcion: '', fecha_evento: '', codigoTipo: this.tipos[0]?.codigo || '' };
    this.modalCrearAbierta = true;
    this.cdr.detectChanges();
  }

  /**
   * Cierra el modal de creación de eventos.
   * * @returns {void}
   */
  cerrarModalCrear(): void {
    this.modalCrearAbierta = false;
    this.cdr.detectChanges();
  }

  /**
   * Envía el nuevo evento al servidor. Valida los campos mínimos requeridos.
   * * @returns {void}
   */
  guardarEvento(): void {
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