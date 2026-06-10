// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { ToastService } from '../../../services/toast';
// #endregion

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
  standalone: false
})
export class Perfil implements OnInit {

  // #region PROPIEDADES
  personajes: any[] = [];
  personajeSeleccionado: any = null;
  codigoSeleccionado: string = ''; 
  nuevoLinkRaiderIo: string = '';
  
  characterData: any = null;
  cargando: boolean = true;
  errorCarga: boolean = false;
  mensajeError: string = 'Invocando datos desde las Tierras Sombrías...';

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

  // #region CONSTRUCTOR
  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private toast: ToastService 
  ) {}
  // #endregion

  // #region CICLO DE VIDA
  /**
   * Ciclo de vida de inicialización del componente.
   * Dispara la carga concurrente de los datos maestros (clases, specs, etc.) 
   * necesarios para renderizar el perfil y sus formularios.
   * * @returns {void}
   */
  ngOnInit(): void {
    this.cargarDatosAuxiliares();
  }
  // #endregion

  // #region UTILIDADES
  /**
   * Genera las cabeceras HTTP de autorización estándar para las peticiones API.
   * Recupera e inyecta el token JWT almacenado en el LocalStorage.
   * * @private
   * @returns {HttpHeaders}
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  /**
   * Gestiona la presentación de errores críticos en la interfaz.
   * Detiene el estado de carga y muestra el mensaje proporcionado.
   * * @param {string} m - El mensaje de error a mostrar.
   * @returns {void}
   */
  mostrarError(m: string): void {
    this.mensajeError = m;
    this.errorCarga = true;
    this.cargando = false;
    this.cdr.detectChanges(); 
  }
  // #endregion

  // #region GESTIÓN DE PERSONAJES
  /**
   * Recupera de forma paralela los catálogos auxiliares (clases, especializaciones, profesiones).
   * Al finalizar con éxito, separa las profesiones por nivel y desencadena 
   * la obtención de los personajes del usuario.
   * * @returns {void}
   */
  cargarDatosAuxiliares(): void {
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

  /**
   * Obtiene la lista completa de personajes (alters y main) vinculados al usuario.
   * Si existen registros, auto-selecciona el personaje principal por defecto 
   * para cargar sus detalles en la interfaz.
   * * @returns {void}
   */
  cargarListaPersonajes(): void {
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

  /**
   * Escucha los cambios del selector de personajes en la interfaz.
   * Busca el objeto correspondiente al código seleccionado e inicia su actualización en vista.
   * * @param {string} codigo - El identificador único del personaje seleccionado.
   * @returns {void}
   */
  onCodigoCambiado(codigo: string): void {
    const encontrado = this.personajes.find(p => String(p.codigo) === String(codigo));
    if (encontrado) {
      this.actualizarPersonaje(encontrado);
    }
  }

  /**
   * Prepara el formulario de edición y la vista principal con los datos de un personaje específico.
   * Resetea estados previos y lanza la consulta asíncrona a Raider.io para obtener métricas frescas.
   * * @param {any} personaje - Objeto con los datos del personaje provenientes del backend.
   * @returns {void}
   */
  actualizarPersonaje(personaje: any): void {
    this.cargando = true;
    this.errorCarga = false;
    this.characterData = null;
    
    this.personajeSeleccionado = personaje;
    this.codigoSeleccionado = personaje.codigo; 
    
    this.editClase = personaje.clase || '';
    this.editSpec = personaje.spec || '';
    this.editP1 = personaje.profesion1 || '';
    this.editP2 = personaje.profesion2 || '';
    this.editS1 = personaje.profesion_sec1 || '';
    this.editS2 = personaje.profesion_sec2 || '';
    
    this.onClaseChange();
    this.cargarPerfilRaiderIo(personaje.region, personaje.reino, personaje.nombre);
  }

  /**
   * Actualiza dinámicamente las especializaciones disponibles en el desplegable 
   * en base a la clase que el usuario haya seleccionado en el modo de edición.
   * * @returns {void}
   */
  onClaseChange(): void {
    const claseObj = this.auxClases.find(c => c.nombre === this.editClase);
    this.specsFiltradas = claseObj ? this.auxSpecs.filter(s => s.codigoClase === claseObj.codigo) : [];
    if (!this.specsFiltradas.find(s => s.nombre === this.editSpec)) this.editSpec = '';
  }

  /**
   * Empaqueta y envía al servidor los ajustes manuales de clase, especialización y profesiones.
   * Resuelve automáticamente la función (Tanque, Healer, DPS) basándose en la especialización.
   * Muestra notificaciones Toast informando del resultado de la operación.
   * * @returns {void}
   */
  guardarConfiguracionPersonaje(): void {
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
          this.toast.showSuccess('Configuración de personaje actualizada.'); // <-- TOAST ÉXITO
          Object.assign(this.personajeSeleccionado, payload);
          this.cdr.detectChanges();
        },
        error: () => {
          this.guardandoDatos = false;
          this.toast.showError('Error al guardar la configuración.'); // <-- TOAST ERROR
        }
      });
  }

  /**
   * Designa al personaje actualmente seleccionado en la vista como el personaje principal.
   * Envía la solicitud a la API y recarga la lista para reflejar los cambios globales.
   * * @returns {void}
   */
  marcarComoMain(): void {
    this.http.post('http://192.168.1.130:8000/api/marcar-main', { codigo: this.codigoSeleccionado }, { headers: this.getHeaders() })
      .subscribe(() => { 
        this.toast.showSuccess('Personaje principal actualizado.');
        this.cargarListaPersonajes(); 
      });
  }

  /**
   * Intenta registrar un nuevo personaje alter a la cuenta basándose en una URL de Raider.io.
   * Despliega alertas Toast para notificar el éxito o el fallo de la importación.
   * * @returns {void}
   */
  agregarNuevoPersonaje(): void {
    if (!this.nuevoLinkRaiderIo) return;
    this.cargando = true;
    this.http.post('http://192.168.1.130:8000/api/añadir-personaje', { raiderio_url: this.nuevoLinkRaiderIo }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.nuevoLinkRaiderIo = '';
          this.toast.showSuccess('Nuevo personaje reclutado con éxito.'); // <-- TOAST ÉXITO
          this.cargarDatosAuxiliares();
        },
        error: () => {
          this.cargando = false;
          this.toast.showError('Error al añadir el personaje. Verifica la URL.'); // <-- TOAST ERROR
        }
      });
  }

  /**
   * Consulta la API pública de Raider.io para extraer información en tiempo real 
   * sobre el progreso de mazmorras y bandas del personaje especificado.
   * Limpia los parámetros de entrada y purga datos de expansiones/eventos irrelevantes.
   * * @param {string} region - La región del servidor (e.g., 'eu').
   * @param {string} reino - El nombre del reino o servidor.
   * @param {string} nombre - El nombre del personaje en el juego.
   * @returns {void}
   */
  cargarPerfilRaiderIo(region: string, reino: string, nombre: string): void {
    if (!region || !reino || !nombre) {
      this.cargando = false;
      return;
    }

    const rLimpia = region.toLowerCase().trim();
    const rLimpio = reino.toLowerCase()
                         .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                         .replace(/\s+/g, '-');
    const nLimpio = nombre.trim();

    const baseUrl = `https://raider.io/api/v1/characters/profile`;
    const params = `region=${encodeURIComponent(rLimpia)}&realm=${encodeURIComponent(rLimpio)}&name=${encodeURIComponent(nLimpio)}&fields=gear,mythic_plus_scores_by_season:current,raid_progression`;
    
    this.http.get(`${baseUrl}?${params}`).subscribe({
      next: (data: any) => {
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
  // #endregion
}