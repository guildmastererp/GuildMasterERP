import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-loot',
  templateUrl: './loot.html',
  styleUrls: ['./loot.css'],
  standalone: false
})
export class Loot implements OnInit {
  // #region PROPIEDADES DE SEGURIDAD Y ESTADO
  esAdmin: boolean = false;
  cargando: boolean = true;
  procesando: boolean = false;
  // #endregion

  // #region DATOS DEL COMPONENTE
  historialLoot: any[] = [];
  jugadoresDisponibles: any[] = [];
  
  expansiones: any[] = [];
  temporadas: any[] = [];
  raids: any[] = [];
  bosses: any[] = [];
  items: any[] = [];
  // #endregion

  // #region FILTROS Y FORMULARIO
  // Cambiado 'itemsSeleccionados' (array) por 'item' (string) para selección única
  filtro = { 
    expansion: '', 
    temporada: '', 
    raid: '', 
    boss: '', 
    item: '' 
  };
  
  nuevoLoot = { fecha: '', codigoPersonaje: '' };
  // #endregion

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.comprobarRol();
    this.cargarJugadores();
    this.cargarEstructura();
    this.cargarHistorial();
    
    const hoy = new Date();
    this.nuevoLoot.fecha = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
  }

  // #region GETTERS FILTROS
  get temporadasFiltradas() { return this.temporadas.filter(t => t.codigoExpa == this.filtro.expansion); }
  get raidsFiltradas() { return this.raids.filter(r => r.codigoTemporada == this.filtro.temporada); }
  get bossesFiltrados() { return this.bosses.filter(b => b.codigoRaid == this.filtro.raid); }
  
  // Getter corregido: Fusiona nombre y rareza para el combo de selección única
  get itemsFiltrados() { 
    return this.items
      .filter(i => i.codigoBoss == this.filtro.boss)
      .map(i => ({ ...i, display: `${i.nombre} - ${i.rareza}` }));
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
      .subscribe(user => this.esAdmin = (user.codigo_rol === '0001' || user.codigo_rol === '0002'));
  }

  cargarEstructura() {
    this.http.get<any>('http://192.168.1.130:8000/api/loot/estructura', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.expansiones = data.expansiones;
          this.temporadas = data.temporadas;
          this.raids = data.raids;
          this.bosses = data.bosses;
          this.items = data.items;
        },
        error: (err) => console.error("Error al cargar estructura:", err)
      });
  }

  cargarJugadores() {
    this.http.get<any[]>('http://192.168.1.130:8000/api/aux-personajes', { headers: this.getHeaders() })
      .subscribe(data => this.jugadoresDisponibles = data);
  }

  cargarHistorial() {
    this.cargando = true;
    this.http.get<any[]>('http://192.168.1.130:8000/api/loot', { headers: this.getHeaders() })
      .subscribe(data => { this.historialLoot = data; this.cargando = false; });
  }
  // #endregion

  // #region LÓGICA DE REGISTRO
  registrarLoot() {
    if (!this.filtro.item || !this.nuevoLoot.codigoPersonaje) {
      alert('Selecciona un ítem y un jugador.');
      return;
    }

    this.procesando = true;
    
    // Enviamos el código del ítem seleccionado. 
    // Nota: El backend espera 'bosses' como array, enviamos el item en un array de 1 elemento.
    const payload = {
      fecha: this.nuevoLoot.fecha,
      codigoPersonaje: this.nuevoLoot.codigoPersonaje,
      bosses: [this.filtro.item] 
    };

    this.http.post('http://192.168.1.130:8000/api/loot/add', payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          alert('Loot registrado correctamente');
          this.filtro.item = ''; // Limpiar selección
          this.cargarHistorial();
          this.procesando = false;
        },
        error: () => {
          alert('Error al registrar el loot.');
          this.procesando = false;
        }
      });
  }
  // #endregion
}