// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from '../../../services/toast';
// #endregion

@Component({
  selector: 'app-registro-miticas',
  templateUrl: './registro.html',
  styleUrls: ['./registro.css'],
  standalone: false
})
export class RegistroMiticas implements OnInit {

  // #region PROPIEDADES DE ESTADO
  esAdmin: boolean = false;
  cargando: boolean = true;
  sincronizandoIO: boolean = false;

  historialMiticas: any[] = [];
  jugadoresDisponibles: any[] = [];
  expansiones: any[] = [];
  temporadas: any[] = [];
  miticas: any[] = [];

  filtroMazmorra: string = '';
  filtroNivel: number | null = null;
  // #endregion

  // #region CONSTRUCTOR
  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}
  // #endregion

  // #region CICLO DE VIDA
  /**
   * Inicializa el componente cargando los datos maestros, el historial
   * y comprobando los privilegios del usuario actual.
   */
  ngOnInit(): void {
    this.comprobarRol();
    this.cargarJugadores();
    this.cargarEstructura();
    this.cargarHistorial();
  }
  // #endregion

  // #region GETTERS DE FILTRADO
  /**
   * Getter que aplica los filtros actuales (mazmorra y nivel) al historial de míticas.
   * * @returns {any[]} Array filtrado de registros de míticas.
   */
  get historialFiltrado(): any[] {
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
  /**
   * Genera las cabeceras HTTP necesarias, incluyendo el token de sesión.
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
   * Valida si el usuario actual posee permisos de administrador.
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
   * Obtiene la estructura jerárquica de contenido (Expansiones, Temporadas, Mazmorras).
   * * @returns {void}
   */
  cargarEstructura(): void {
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

  /**
   * Carga el listado de jugadores/personajes disponibles en el ERP.
   * * @returns {void}
   */
  cargarJugadores(): void {
    this.http.get<any[]>('http://192.168.1.130:8000/api/aux-personajes', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.jugadoresDisponibles = data;
          this.cdr.detectChanges();
        },
        error: () => this.cdr.detectChanges()
      });
  }

  /**
   * Obtiene el historial de registros de míticas desde el backend.
   * * @returns {void}
   */
  cargarHistorial(): void {
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
  /**
   * Lanza el proceso de sincronización con la API de Raider.io.
   * Muestra notificaciones al usuario sobre el éxito o fallo de la operación
   * y recarga el historial al finalizar.
   * * @returns {void}
   */
  sincronizarConRaiderIO(): void {
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