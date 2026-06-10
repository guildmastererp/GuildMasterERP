// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { ToastService, Toast } from '../../../services/toast'; 
// #endregion

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrls: ['./layout.css'],
  standalone: false
})
export class Layout implements OnInit {
  
  // #region PROPIEDADES 
  menuActivo: string = 'Comunidad';
  esAdmin: boolean = false;
  rutaActiva: string = '';
  pestanasAbiertas: any[] = [];

  menus: any = {
    'Comunidad': [
      { nombre: 'Perfil', ruta: '/principal/comunidad/perfil', icono: '/images/ico_usuario.png' },
      { nombre: 'Ranking', ruta: '/principal/comunidad/ranking', icono: '/images/ico_ranking.png' },
      { nombre: 'Buscador', ruta: '/principal/comunidad/buscador', icono: '/images/ico_buscador.png' },
      { nombre: 'Guías', ruta: '/principal/comunidad/guias', icono: '/images/ico_guias.png' }
    ],
    'Raid': [
      { nombre: 'Organización', ruta: '/principal/raid/organizacion', icono: '/images/ico_organizacion.png' },
      { nombre: 'Gestión Roster', ruta: '/principal/raid/roster', icono: '/images/ico_calendarioRaid.png' },
      { nombre: 'Registro Loot', ruta: '/principal/raid/loot', icono: '/images/ico_lootRaid.png' }
    ],
    'Míticas+': [
      { nombre: 'Registro runs', ruta: '/principal/miticas/registro', icono: '/images/ico_miticas.png' },
      { nombre: 'Guías', ruta: '/principal/miticas/guias', icono: '/images/ico_guias.png' }
    ],
    'Eventos': [
      { nombre: 'Tablón', ruta: '/principal/eventos/tablon', icono: '/images/ico_tablon.png' },
      { nombre: 'Inscripción', ruta: '/principal/eventos/inscripcion', icono: '/images/ico_inscripciones.png' }
    ],
    'Configuración': [
      { nombre: 'Ajustes cuenta', ruta: '/principal/configuracion/ajustes', icono: '/images/miniLogo.png' }
    ]
  };
  objectKeys = Object.keys;

  toasts: Toast[] = [];
  mostrarModalLogout: boolean = false;
  // #endregion

  // #region CONSTRUCTOR
  constructor(
    private router: Router, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {}
  // #endregion

  // #region CICLO DE VIDA
  /**
   * Inicializa las suscripciones a eventos de navegación y al servicio de toasts.
   * También verifica los permisos del usuario para ajustar el menú dinámicamente.
   */
  ngOnInit(): void {
    this.comprobarRolUsuario();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.rutaActiva = event.urlAfterRedirects;
    });

    this.toastService.toasts$.subscribe(toast => {
      this.toasts.push(toast);
      this.cdr.detectChanges();
      setTimeout(() => this.removerToast(toast.id), 3500);
    });
  }
  // #endregion

  // #region GESTIÓN DE NOTIFICACIONES
  /**
   * Elimina un mensaje de notificación (Toast) de la lista activa.
   * @param id - Identificador único del toast a eliminar.
   */
  removerToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.detectChanges();
  }
  // #endregion

  // #region SEGURIDAD Y PERMISOS
  /**
   * Genera las cabeceras HTTP de autorización estándar.
   * @private
   * @returns {HttpHeaders}
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    });
  }

  /**
   * Consulta el backend para validar el rol del usuario actual.
   * Si el usuario es administrador (0001 o 0002), añade dinámicamente
   * la opción de "Gestión Puntos" al menú de Comunidad.
   */
  comprobarRolUsuario(): void {
    this.http.get<any>('http://192.168.1.130:8000/api/user', { headers: this.getHeaders() })
      .subscribe({
        next: (user) => {
          if (user.codigo_rol === '0001' || user.codigo_rol === '0002') {
            this.esAdmin = true;
            const botonExiste = this.menus['Comunidad'].find((m: any) => m.nombre === 'Gestión Puntos');
            if (!botonExiste) {
              this.menus['Comunidad'].push({ 
                nombre: 'Gestión Puntos', 
                ruta: '/principal/comunidad/gestion-puntos', 
                icono: '/images/ico_lootRaid.png' 
              });
              this.cdr.detectChanges(); 
            }
          }
        },
        error: (err) => {
          console.error('Error al obtener el rol del usuario', err);
        }
      });
  }
  // #endregion

  // #region NAVEGACIÓN
  /**
   * Gestiona la apertura de una nueva pestaña en el layout.
   * Evita duplicar pestañas si el usuario hace clic en el mismo menú.
   */
  abrirSeccion(item: any): void {
    const existe = this.pestanasAbiertas.find(p => p.ruta === item.ruta);
    if (!existe) {
      this.pestanasAbiertas.push(item);
    }
    this.router.navigate([item.ruta]);
  }

  /** Navegación directa por ruta. */
  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  /**
   * Cierra la pestaña abierta. Si es la última, redirige a la vista principal.
   * De lo contrario, navega a la pestaña inmediatamente anterior.
   */
  cerrarPestana(index: number, event: Event): void {
    event.stopPropagation(); 
    event.preventDefault();
    
    this.pestanasAbiertas.splice(index, 1);

    if (this.pestanasAbiertas.length === 0) {
      this.router.navigate(['/principal']);
    } else {
      const ultimaPestana = this.pestanasAbiertas[this.pestanasAbiertas.length - 1];
      this.router.navigate([ultimaPestana.ruta]);
    }
  }
  // #endregion

  // #region SESIÓN Y UI
  /** Activa el modo pantalla completa del navegador. */
  entrarPantallaCompleta(): void {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.warn('Error al intentar iniciar pantalla completa:', err);
      });
    }
  }

  /** Desactiva el modo pantalla completa. */
  salirPantallaCompleta(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.warn('Error al salir de pantalla completa:', err);
      });
    }
  }

  abrirModalLogout(): void {
    this.mostrarModalLogout = true;
  }

  cerrarModalLogout(): void {
    this.mostrarModalLogout = false;
  }

  /**
   * Finaliza la sesión del usuario: limpia el token, el estado de pestañas,
   * sale de pantalla completa y redirige al login con notificación.
   */
  cerrarSesion(): void {
    this.mostrarModalLogout = false;
    this.salirPantallaCompleta();
    
    localStorage.removeItem('token');
    this.pestanasAbiertas = [];
    
    this.router.navigate(['/login']);
    this.toastService.showSuccess('Has cerrado sesión correctamente.');
  }
  // #endregion
}