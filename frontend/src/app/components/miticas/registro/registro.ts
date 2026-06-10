// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from '../../../services/toast'; // <-- IMPORT DEL SERVICIO
// #endregion

@Component({
  selector: 'app-registro-miticas',
  templateUrl: './registro.html',
  styleUrls: ['./registro.css'],
  standalone: false
})
export class RegistroMiticas implements OnInit {
  // #region PROPIEDADES DE SEGURIDAD Y ESTADO
  esAdmin: boolean = false;
  cargando: boolean = true;
  sincronizandoIO: boolean = false;
  // #endregion

  // #region DATOS DEL COMPONENTE
  historialMiticas: any[] = [];
  jugadoresDisponibles: any[] = [];
  
  expansiones: any[] = [];
  temporadas: any[] = [];
  miticas: any[] = [];
  // #endregion

  // #region FILTROS DE VISTA
  filtroMazmorra: string = '';
  filtroNivel: number | null = null;
  // #endregion

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private toast: ToastService // <-- INYECTADO
  ) {}

  ngOnInit(): void {
    this.comprobarRol();
    this.cargarJugadores();
    this.cargarEstructura();
    this.cargarHistorial();
  }

  // #region LÓGICA DE FILTRADO PARA LA VISTA
  get historialFiltrado() {
    return this.historialMiticas.filter(r => {
      const matchMazmorra = this.filtroMazmorra 
        ? r.mitica_nombre.toLowerCase().includes(this.filtroMazmorra.toLowerCase()) 
        : true;
      const matchNivel = this.filtroNivel 
        ? r.nivel == this.filtroNivel 
        : true;
      return matchMazmorra && matchNivel;
    });
  }
  // #endregion

  // #region SERVICIOS Y SEGURIDAD
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

  cargarEstructura() {
    this.http.get<any>('http://192.168.1.130:8000/api/miticas/estructura', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.expansiones = data.expansiones;
          this.temporadas = data.temporadas;
          this.miticas = data.miticas;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al cargar estructura:", err);
          this.cdr.detectChanges();
        }
      });
  }

  cargarJugadores() {
    this.http.get<any[]>('http://192.168.1.130:8000/api/aux-personajes', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.jugadoresDisponibles = data;
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }

  cargarHistorial() {
    this.cargando = true;
    this.http.get<any[]>('http://192.168.1.130:8000/api/miticas', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => { 
          this.historialMiticas = data; 
          this.cargando = false; 
          this.cdr.detectChanges();
        },
        error: () => {
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }
  // #endregion

  // #region SINCRONIZACIÓN
  sincronizarConRaiderIO() {
    this.sincronizandoIO = true;
    
    this.http.post<any>('http://192.168.1.130:8000/api/miticas/sincronizar', {}, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          this.toast.showSuccess(res.message);
          this.cargarHistorial(); 
          this.sincronizandoIO = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al sincronizar con R.IO", err);
          this.toast.showError('Hubo un error al intentar sincronizar con Raider.io.'); 
          this.sincronizandoIO = false;
          this.cdr.detectChanges();
        }
      });
  }
  // #endregion
}