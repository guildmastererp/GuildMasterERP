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
  
  specsFiltradas: any[] = []; // Se llena al elegir una clase

  editClase: string = '';
  editSpec: string = '';
  editProfesion: string = '';
  guardandoDatos: boolean = false;

  // #endregion

  // #region CONSTRUCTOR

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  // #endregion

  // #region METODOS

    // #region HOOKS
    
  /**
   * @description Inicializa el componente cargando primero las tablas maestras y luego los personajes.
   */
  ngOnInit(): void {
    this.cargarDatosAuxiliares();
  }

    // #endregion

    // #region UTILIDADES Y CONFIGURACIÓN

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

    // #region GESTIÓN DE PERSONAJES Y ESTADO

  /**
   * @description Descarga las tablas auxiliares en paralelo para los combos. Una vez listas, carga el roster.
   */
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
        this.auxProfesiones = res.profesiones;
        this.auxFunciones = res.funciones;
        
        // Una vez tenemos los combos listos, pedimos los personajes
        this.cargarListaPersonajes();
      },
      error: () => this.mostrarError('Error al cargar las tablas maestras de la base de datos.')
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

  actualizarPersonaje(personaje: any) {
    this.personajeSeleccionado = personaje;
    this.codigoSeleccionado = personaje.codigo; 
    
    // Sincronizamos los combos manuales con los datos guardados en BD
    this.editClase = personaje.clase || '';
    this.editProfesion = personaje.profesion || '';
    this.onClaseChange(); // Forzamos el filtrado de specs basado en la clase cargada
    this.editSpec = personaje.spec || '';

    this.cargarPerfilRaiderIo(personaje.region, personaje.reino, personaje.nombre);
  }

  onCodigoCambiado(codigo: string) {
    const encontrado = this.personajes.find(p => p.codigo === codigo);
    if (encontrado) {
      this.actualizarPersonaje(encontrado);
    }
  }

    // #endregion

    // #region EDICIÓN MANUAL DE CONFIGURACIÓN (NUEVO)

  /**
   * @description Filtra las especializaciones disponibles basándose en la clase seleccionada en el combo.
   */
  onClaseChange() {
    const claseSeleccionadaObj = this.auxClases.find(c => c.nombre === this.editClase);
    
    if (claseSeleccionadaObj) {
      this.specsFiltradas = this.auxSpecs.filter(s => s.codigoClase === claseSeleccionadaObj.codigo);
    } else {
      this.specsFiltradas = [];
    }
    
    // Reseteamos el combo de spec para evitar selecciones fantasma
    this.editSpec = ''; 
  }

  /**
   * @description Calcula la función automáticamente basándose en la spec elegida y envía los datos a guardar.
   */
  guardarConfiguracionPersonaje() {
    let funcionAuto = '';

    // Buscamos el objeto de la clase y la spec seleccionadas para extraer los códigos
    const claseObj = this.auxClases.find(c => c.nombre === this.editClase);
    
    if (claseObj && this.editSpec) {
      const specObj = this.auxSpecs.find(s => s.nombre === this.editSpec && s.codigoClase === claseObj.codigo);
      
      if (specObj) {
        // Encontramos la función a través del 'codigoFuncion' que hay en la tabla aux_spec
        const funcionObj = this.auxFunciones.find(f => f.codigo === specObj.codigoFuncion);
        if (funcionObj) {
          funcionAuto = funcionObj.nombre;
        }
      }
    }

    const payload = {
      codigo: this.codigoSeleccionado,
      clase: this.editClase,
      spec: this.editSpec,
      profesion: this.editProfesion,
      funcion: funcionAuto // Se asigna de forma 100% automática
    };

    this.guardandoDatos = true;
    this.http.post('http://192.168.1.130:8000/api/actualizar-datos-personaje', payload, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.guardandoDatos = false;
          alert('Configuración del personaje guardada correctamente.');
          
          // Actualizamos el objeto local para no tener que recargar toda la página
          if (this.personajeSeleccionado) {
            this.personajeSeleccionado.clase = this.editClase;
            this.personajeSeleccionado.spec = this.editSpec;
            this.personajeSeleccionado.profesion = this.editProfesion;
            this.personajeSeleccionado.funcion = funcionAuto;
          }
        },
        error: () => {
          this.guardandoDatos = false;
          alert('Error al guardar los datos del personaje.');
        }
      });
  }

    // #endregion

  marcarComoMain() {
    if(!this.personajeSeleccionado) return;
    this.http.post('http://192.168.1.130:8000/api/marcar-main', { codigo: this.codigoSeleccionado }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          alert('Personaje principal actualizado.');
          this.cargarListaPersonajes(); // Recargamos para refrescar la marca
        },
        error: () => alert('Error al actualizar el personaje principal.')
      });
  }

  agregarNuevoPersonaje() {
    if (!this.nuevoLinkRaiderIo) {
      alert('Introduce un enlace válido.');
      return;
    }
    this.cargando = true;
    this.http.post('http://192.168.1.130:8000/api/añadir-personaje', { raiderio_url: this.nuevoLinkRaiderIo }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          alert('Alter añadido a tu cuenta.');
          this.nuevoLinkRaiderIo = '';
          this.cargarDatosAuxiliares(); // Reiniciamos el ciclo de vida completo
        },
        error: () => {
          this.cargando = false;
          alert('Error al añadir el personaje. Comprueba que el enlace es correcto.');
        }
      });
  }

  cargarPerfilRaiderIo(region: string, reino: string, nombre: string) {
    this.cargando = true;
    this.errorCarga = false;
    this.characterData = null;

    // Aquí está la magia: Limpiamos por completo la región y el reino para Raider.io
    const regionLimpia = region ? region.toLowerCase().trim() : '';
    const reinoLimpio = reino ? reino.toLowerCase().trim().replace(/\s+/g, '-').replace(/'/g, '') : '';
    const nombreLimpio = nombre ? nombre.toLowerCase().trim() : '';

    const apiUrl = `https://raider.io/api/v1/characters/profile?region=${regionLimpia}&realm=${reinoLimpio}&name=${nombreLimpio}&fields=gear,mythic_plus_scores_by_season:current,raid_progression`;

    this.http.get(apiUrl).subscribe({
      next: (data: any) => {
        if (data.raid_progression) {
          const raidsActuales = Object.keys(data.raid_progression).filter(key => 
            !key.startsWith('tier-') && key !== 'world-of-warcraft-remix-mists-of-pandaria'
          );

          const progresoFiltrado: any = {};
          raidsActuales.forEach(key => {
            progresoFiltrado[key] = data.raid_progression[key];
          });
          
          data.raid_progression = progresoFiltrado;
        }

        this.characterData = data;
        this.cargando = false;
        this.errorCarga = false;
      },
      error: (e) => {
        console.error('Fallo en Raider.io:', e);
        this.mostrarError('No se pudo sincronizar el personaje de Raider.io. Verifica que el personaje exista y sea nivel máximo.');
      }
    });
  }
}