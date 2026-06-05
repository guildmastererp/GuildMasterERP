// #region IMPORTS

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { filter } from 'rxjs/operators';

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
  esAdmin: boolean = false; // Propiedad para controlar si es Master/Oficial

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
      { nombre: 'Tablón ', ruta: '/principal/eventos/tablon', icono: '/images/ico_tablon.png' },
      { nombre: 'Inscripción', ruta: '/principal/eventos/inscripcion', icono: '/images/ico_inscripciones.png' }
    ],
    'Configuración': [
      { nombre: 'Ajustes cuenta', ruta: '/principal/configuracion/ajustes', icono: '/images/miniLogo.png' }
    ]
  };

  pestanasAbiertas: any[] = [];
  rutaActiva: string = '';
  objectKeys = Object.keys;

  // #endregion

  // #region CONSTRUCTOR

  constructor(
    private router: Router, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // #endregion

  // #region METODOS

    // #region HOOKS
    
  /**
   * @description Inicializa el componente suscribiéndose a los eventos de navegación del Router
   * y comprobando el rango del usuario para adaptar el menú.
   */
  ngOnInit() {
    // 1. Comprobar el rol del usuario en base de datos
    this.comprobarRolUsuario();

    // 2. Suscripción a los eventos de navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.rutaActiva = event.urlAfterRedirects;
    });
  }
    // #endregion

    // #region CONTROL DE ROLES Y PERMISOS

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    });
  }

  /**
   * @description Consulta la API para obtener los datos del usuario logueado. 
   * Si tiene rol '0001' (Master) o '0002' (Oficial), inyecta la pestaña de gestión de puntos.
   */
  comprobarRolUsuario() {
    this.http.get<any>('http://192.168.1.130:8000/api/user', { headers: this.getHeaders() })
      .subscribe({
        next: (user) => {
          if (user.codigo_rol === '0001' || user.codigo_rol === '0002') {
            this.esAdmin = true;
            
            // Comprobamos si el botón ya existe para no duplicarlo
            const botonExiste = this.menus['Comunidad'].find((m: any) => m.nombre === 'Gestión Puntos');
            
            if (!botonExiste) {
              this.menus['Comunidad'].push({ 
                nombre: 'Gestión Puntos', 
                ruta: '/principal/comunidad/gestion-puntos', 
                icono: '/images/ico_lootRaid.png' // Puedes cambiar este icono por uno específico de puntos si lo tienes
              });
              
              // Forzamos a Angular a repintar la vista inmediatamente
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

    // #region MÉTODOS DE NAVEGACIÓN

  /**
   * @description Gestiona la apertura de módulos desde el menú Ribbon.
   * Verifica la existencia de la sección en el histórico de pestañas abiertas; si no existe, 
   * la registra en el arreglo dinámico. La redirección real se hace vía routerLink en el HTML.
   * @param item Objeto de configuración de la sección seleccionada (nombre, ruta, icono).
   */
  abrirSeccion(item: any) {
    const existe = this.pestanasAbiertas.find(p => p.ruta === item.ruta);
    if (!existe) {
      this.pestanasAbiertas.push(item);
    }
  }

  /**
   * @description Realiza la navegación directa hacia una ruta específica del ERP.
   * La redirección real se hace vía routerLink en el HTML, por lo que aquí ya no es necesario forzarla.
   * @param ruta Cadena de texto con la dirección de navegación de destino.
   */
  navegarA(ruta: string) {
    // Vacío porque la navegación la maneja ahora el directiva [routerLink] nativa de Angular
  }

  /**
   * @description Remueve una pestaña del listado de vistas activas controlando el evento de propagación.
   * Calcula el nuevo flujo de navegación: si el arreglo queda vacío, redirige a la raíz del panel principal;
   * en caso contrario, transfiere el foco de la aplicación a la última pestaña disponible.
   * @param index Posición numérica de la pestaña dentro del arreglo.
   * @param event Instancia del evento nativo para gestionar el flujo de captura/burbujeo.
   */
  cerrarPestana(index: number, event: Event) {
    event.stopPropagation(); 
    event.preventDefault(); // Evitamos que el clic se propague al routerLink subyacente
    
    this.pestanasAbiertas.splice(index, 1);

    if (this.pestanasAbiertas.length === 0) {
      this.router.navigate(['/principal']);
    } else {
      const ultimaPestana = this.pestanasAbiertas[this.pestanasAbiertas.length - 1];
      this.router.navigate([ultimaPestana.ruta]);
    }
  }

    // #endregion

  // #endregion
}