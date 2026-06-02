// #region IMPORTS

import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
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

  constructor(private router: Router) {}

  // #endregion

// #region METODOS

    // #region HOOKS
    
  /**
   * @description Inicializa el componente suscribiéndose a los eventos de navegación del Router.
   * Detecta la finalización de los cambios de ruta para mantener sincronizado el estado de la pestaña activa.
   */
  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.rutaActiva = event.urlAfterRedirects;
    });
  }
    // #endregion

    // #region MÉTODOS DE NAVEGACIÓN

  /**
   * @description Gestiona la apertura de módulos desde el menú Ribbon.
   * Verifica la existencia de la sección en el histórico de pestañas abiertas; si no existe, 
   * la registra en el arreglo dinámico y ejecuta la redirección hacia la ruta destino.
   * @param item Objeto de configuración de la sección seleccionada (nombre, ruta, icono).
   */
  abrirSeccion(item: any) {
    const existe = this.pestanasAbiertas.find(p => p.ruta === item.ruta);
    if (!existe) {
      this.pestanasAbiertas.push(item);
    }
    this.router.navigate([item.ruta]);
  }

  /**
   * @description Realiza la navegación directa hacia una ruta específica del ERP.
   * Empleado como manejador de eventos al conmutar el foco entre pestañas inferiores ya existentes.
   * @param ruta Cadena de texto con la dirección de navegación de destino.
   */
  navegarA(ruta: string) {
    this.router.navigate([ruta]);
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