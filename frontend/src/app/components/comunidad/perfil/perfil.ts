// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
// #endregion

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
  standalone: false
})
export class Perfil implements OnInit {

  // #region PROPIEDADES DE ESTADO Y PERSONAJES
  personajes: any[] = [];
  personajeSeleccionado: any = null;
  codigoSeleccionado: string = ''; 
  nuevoLinkRaiderIo: string = '';
  
  characterData: any = null;
  cargando: boolean = true;
  errorCarga: boolean = false;
  mensajeError: string = 'Invocando datos desde las Tierras Sombrías...';
  // #endregion

  // #region PROPIEDADES DE TABLAS AUXILIARES Y EDICIÓN
  auxClases: any[] = [];
  auxSpecs: any[] = [];
  auxProfesiones: any[] = [];
  auxFunciones: any[] = [];
  
  specsFiltradas: any[] = [];
  profesionesPrincipales: any[] = [];
  profesionesSecundarias: any[] = [];

  editClase: string = '';
  editSpec: string = '';
  editP1: string = ''; editP2: string = '';
  editS1: string = ''; editS2: string = '';
  
  guardandoDatos: boolean = false;
  // #endregion

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarDatosAuxiliares();
  }

  // #region UTILIDADES
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  mostrarError(m: string) {
    this.mensajeError = m;
    this.errorCarga = true;
    this.cargando = false;
    this.cdr.detectChanges(); 
  }
  // #endregion

  // #region GESTIÓN DE PERSONAJES
  cargarDatosAuxiliares() {
    this.cargando = true;
    forkJoin({
      clases: this.http.get<any[]>('http://192.168.1.130:8000/api/aux-clases', { headers: this.getHeaders() }),
      specs: this.http.get<any[]>('http://192.168.1.130:8000/api/aux-specs', { headers: this.getHeaders() }),
      profesiones: this.http.get<any[]>('http://192.168.1.130:8000/api/aux-profesiones', { headers: this.getHeaders() }),
      funciones: this.http.get<any[]>('http://192.168.1.130:8000/api/aux-funciones', { headers: this.getHeaders() })
    }).subscribe({
      next: (res) => {
        this.auxClases = res.clases;
        this.auxSpecs = res.specs;
        this.auxFunciones = res.funciones;
        this.profesionesPrincipales = res.profesiones.filter(p => p.nivel === 'Principal');
        this.profesionesSecundarias = res.profesiones.filter(p => p.nivel === 'Secundaria');
        this.cargarListaPersonajes();
      },
      error: () => this.mostrarError('Error al cargar datos auxiliares.')
    });
  }

  cargarListaPersonajes() {
    this.http.get<any[]>('http://192.168.1.130:8000/api/mis-personajes', { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.personajes = data;
          if (this.personajes.length > 0) {
            const main = this.personajes.find(p => p.es_main == 1 || p.es_main === true) || this.personajes[0];
            this.actualizarPersonaje(main);
          } else {
            this.mostrarError('No tienes personajes registrados.');
          }
        },
        error: () => this.mostrarError('Error al cargar tu roster.')
      });
  }

  // Este método es disparado por (ngModelChange) en el HTML
  onCodigoCambiado(codigo: string) {
    const encontrado = this.personajes.find(p => String(p.codigo) === String(codigo));
    if (encontrado) {
      this.actualizarPersonaje(encontrado);
    }
  }

  actualizarPersonaje(personaje: any) {
    // 1. Limpieza de estado para forzar refresco del *ngIf
    this.cargando = true;
    this.errorCarga = false;
    this.characterData = null;
    
    // 2. Asignación de datos
    this.personajeSeleccionado = personaje;
    this.codigoSeleccionado = personaje.codigo; 
    
    this.editClase = personaje.clase || '';
    this.editSpec = personaje.spec || '';
    this.editP1 = personaje.profesion1 || '';
    this.editP2 = personaje.profesion2 || '';
    this.editS1 = personaje.profesion_sec1 || '';
    this.editS2 = personaje.profesion_sec2 || '';
    
    this.onClaseChange();
    
    // 3. Petición externa (Raider.io)
    this.cargarPerfilRaiderIo(personaje.region, personaje.reino, personaje.nombre);
  }

  onClaseChange() {
    const claseObj = this.auxClases.find(c => c.nombre === this.editClase);
    this.specsFiltradas = claseObj ? this.auxSpecs.filter(s => s.codigoClase === claseObj.codigo) : [];
    if (!this.specsFiltradas.find(s => s.nombre === this.editSpec)) this.editSpec = '';
  }

  guardarConfiguracionPersonaje() {
    const claseObj = this.auxClases.find(c => c.nombre === this.editClase);
    const specObj = this.auxSpecs.find(s => s.nombre === this.editSpec && s.codigoClase === claseObj?.codigo);
    const funcionAuto = this.auxFunciones.find(f => f.codigo === specObj?.codigoFuncion)?.nombre || '';

    const payload = {
      codigo: this.codigoSeleccionado,
      clase: this.editClase,
      spec: this.editSpec,
      funcion: funcionAuto,
      profesion1: this.editP1, profesion2: this.editP2,
      profesion_sec1: this.editS1, profesion_sec2: this.editS2
    };

    this.guardandoDatos = true;
    this.http.post('http://192.168.1.130:8000/api/actualizar-datos-personaje', payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.guardandoDatos = false;
          alert('Datos actualizados.');
          Object.assign(this.personajeSeleccionado, payload);
          this.cdr.detectChanges();
        },
        error: () => {
          this.guardandoDatos = false;
          alert('Error al guardar.');
        }
      });
  }

  marcarComoMain() {
    this.http.post('http://192.168.1.130:8000/api/marcar-main', { codigo: this.codigoSeleccionado }, { headers: this.getHeaders() })
      .subscribe(() => { this.cargarListaPersonajes(); });
  }

  agregarNuevoPersonaje() {
    if (!this.nuevoLinkRaiderIo) return;
    this.cargando = true;
    this.http.post('http://192.168.1.130:8000/api/añadir-personaje', { raiderio_url: this.nuevoLinkRaiderIo }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.nuevoLinkRaiderIo = '';
          this.cargarDatosAuxiliares();
        },
        error: () => {
          this.cargando = false;
          alert('Error al añadir personaje.');
        }
      });
  }

  cargarPerfilRaiderIo(region: string, reino: string, nombre: string) {
    if (!region || !reino || !nombre) {
      this.cargando = false;
      return;
    }

    // Normalización para Raider.io (sin acentos, minúsculas, espacios a guiones)
    const rLimpia = region.toLowerCase().trim();
    const rLimpio = reino.toLowerCase()
                         .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                         .replace(/\s+/g, '-');
    const nLimpio = nombre.trim();

    const baseUrl = `https://raider.io/api/v1/characters/profile`;
    const params = `region=${encodeURIComponent(rLimpia)}&realm=${encodeURIComponent(rLimpio)}&name=${encodeURIComponent(nLimpio)}&fields=gear,mythic_plus_scores_by_season:current,raid_progression`;
    
    this.http.get(`${baseUrl}?${params}`).subscribe({
      next: (data: any) => {
        // Filtrado de progresiones irrelevantes
        if (data.raid_progression) {
          const raidsActuales = Object.keys(data.raid_progression).filter(key => 
            !key.startsWith('tier-') && key !== 'world-of-warcraft-remix-mists-of-pandaria'
          );
          const progresoFiltrado: any = {};
          raidsActuales.forEach(key => progresoFiltrado[key] = data.raid_progression[key]);
          data.raid_progression = progresoFiltrado;
        }

        this.characterData = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mostrarError(`No se pudo sincronizar a ${nombre} en ${reino}. Revisa que el nombre sea correcto.`);
      }
    });
  }
}