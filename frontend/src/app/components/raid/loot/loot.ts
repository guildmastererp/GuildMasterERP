// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// #endregion

@Component({
  selector: 'app-loot',
  templateUrl: './loot.html',
  styleUrls: ['./loot.css'],
  standalone: false
})
export class Loot implements OnInit {

  // #region PROPIEDADES 
  esAdmin: boolean = false;
  cargando: boolean = true;
  procesando: boolean = false;

  historialLoot: any[] = [];
  jugadoresDisponibles: any[] = [];
  expansiones: any[] = [];
  temporadas: any[] = [];
  raids: any[] = [];
  bosses: any[] = [];
  items: any[] = [];

  filtro = {
    expansion: '',
    temporada: '',
    raid: '',
    boss: '',
    item: ''
  };

  nuevoLoot = { fecha: '', codigoPersonaje: '' };
  // #endregion

  // #region CONSTRUCTOR
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }
  // #endregion

  // #region CICLO DE VIDA
  /**
   * Inicializa la vista cargando las estructuras de datos, el historial
   * y configurando la fecha actual para el registro de loot.
   */
  ngOnInit(): void {
    this.comprobarRol();
    this.cargarJugadores();
    this.cargarEstructura();
    this.cargarHistorial();

    const hoy = new Date();
    this.nuevoLoot.fecha = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
  }
  // #endregion

  // #region GETTERS DE FILTRADO
  /** Devuelve las temporadas asociadas a la expansión seleccionada. */
  get temporadasFiltradas(): any[] { return this.temporadas.filter(t => t.codigoExpa == this.filtro.expansion); }

  /** Devuelve las raids asociadas a la temporada seleccionada. */
  get raidsFiltradas(): any[] { return this.raids.filter(r => r.codigoTemporada == this.filtro.temporada); }

  /** Devuelve los jefes asociados a la raid seleccionada. */
  get bossesFiltrados(): any[] { return this.bosses.filter(b => b.codigoRaid == this.filtro.raid); }

  /** Devuelve los ítems asociados al jefe seleccionado. */
  get itemsFiltrados(): any[] {
    return this.items
      .filter(i => i.codigoBoss == this.filtro.boss)
      .map(i => ({ ...i, display: `${i.nombre} - ${i.rareza}` }));
  }
  // #endregion

  // #region SERVICIOS Y SEGURIDAD
  /**
   * Genera las cabeceras HTTP de autorización estándar.
   * @private
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    });
  }

  /**
   * Comprueba si el usuario tiene privilegios de administrador.
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
   * Obtiene la estructura jerárquica de contenido (Expansiones, Temporadas, Raids, Bosses, Items).
   */
  cargarEstructura(): void {
    this.http.get<any>('http://192.168.1.130:8000/api/loot/estructura', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.expansiones = data.expansiones;
          this.temporadas = data.temporadas;
          this.raids = data.raids;
          this.bosses = data.bosses;
          this.items = data.items;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al cargar estructura:", err);
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Carga el catálogo de jugadores disponibles.
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
   * Obtiene el historial de registros de loot desde el backend.
   */
  cargarHistorial(): void {
    this.cargando = true;
    this.http.get<any[]>('http://192.168.1.130:8000/api/loot', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.historialLoot = data;
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

  // #region LÓGICA DE REGISTRO
  /**
   * Valida y registra un nuevo ítem de loot en la base de datos.
   */
  registrarLoot(): void {
    if (!this.filtro.item || !this.nuevoLoot.codigoPersonaje) {
      alert('Selecciona un ítem y un jugador.');
      return;
    }

    this.procesando = true;

    const payload = {
      fecha: this.nuevoLoot.fecha,
      codigoPersonaje: this.nuevoLoot.codigoPersonaje,
      bosses: [this.filtro.item]
    };

    this.http.post('http://192.168.1.130:8000/api/loot/add', payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          alert('Loot registrado correctamente');
          this.filtro.item = '';
          this.cargarHistorial();
          this.procesando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          alert('Error al registrar el loot.');
          this.procesando = false;
          this.cdr.detectChanges();
        }
      });
  }
  // #endregion
}