// #region IMPORTS
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
// #endregion

@Component({
  selector: 'app-guias',
  templateUrl: './guias.html',
  styleUrls: ['./guias.css'],
  standalone: false
})
export class Guias implements OnInit {

  // #region PROPIEDADES
  clasesConSpecs: any[] = []; 
  datosOriginales: any[] = []; 

  auxClases: any[] = [];
  auxSpecs: any[] = [];
  auxFunciones: any[] = [];

  cargando: boolean = true;
  errorCarga: boolean = false;
  
  filtroClase: string = '';
  filtroFuncion: string = '';
  // #endregion

  // #region CONSTRUCTOR
  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef
  ) {}
  // #endregion

  // #region CICLO DE VIDA
  /**
   * Ciclo de vida de inicialización del componente.
   * Dispara la carga concurrente de los datos maestros necesarios para 
   * construir la biblioteca de guías al montar la vista.
   * * @returns {void}
   */
  ngOnInit(): void {
    this.cargarDatosMaestros();
  }
  // #endregion

  // #region UTILIDADES
  /**
   * Genera las cabeceras HTTP de autorización estándar para las peticiones API.
   * Recupera el token JWT del almacenamiento local.
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
  // #endregion

  // #region CARGA Y AGRUPACIÓN DE DATOS
  /**
   * Obtiene simultáneamente los catálogos de clases, especializaciones y funciones.
   * Utiliza forkJoin para esperar a que todas las peticiones terminen antes de 
   * proceder con la agrupación de los datos y renderizar la vista.
   * * @returns {void}
   */
  cargarDatosMaestros(): void {
    this.cargando = true;
    
    forkJoin({
      clases: this.http.get<any[]>('http://192.168.1.130:8000/api/aux-clases', { headers: this.getHeaders() }),
      specs: this.http.get<any[]>('http://192.168.1.130:8000/api/aux-specs', { headers: this.getHeaders() }),
      funciones: this.http.get<any[]>('http://192.168.1.130:8000/api/aux-funciones', { headers: this.getHeaders() })
    }).subscribe({
      next: (res) => {
        this.auxClases = res.clases;
        this.auxSpecs = res.specs;
        this.auxFunciones = res.funciones;
        
        this.agruparDatos();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorCarga = true;
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Procesa y estructura los datos planos recibidos de la API.
   * Anida las especializaciones dentro de sus clases correspondientes e inyecta 
   * el nombre de la función de combate (Tanque, Healer, DPS) en cada especialización.
   * * @returns {void}
   */
  agruparDatos(): void {
    const agrupado = this.auxClases.map(clase => {
      const specsDeClase = this.auxSpecs.filter(s => s.codigoClase === clase.codigo).map(spec => {
        const funcionObj = this.auxFunciones.find(f => f.codigo === spec.codigoFuncion);
        return {
          ...spec,
          nombreFuncion: funcionObj ? funcionObj.nombre : 'Desconocido'
        };
      });

      return {
        ...clase,
        specs: specsDeClase
      };
    });

    this.datosOriginales = agrupado;
    this.aplicarFiltros();
  }
  // #endregion

  // #region FILTROS
  /**
   * Filtra la lista estructurada de clases y especializaciones basándose 
   * en los selectores de la interfaz (por Clase y/o por Función).
   * Genera un clon profundo de los datos originales para no perder información 
   * al realizar múltiples filtrados sucesivos.
   * * @returns {void}
   */
  aplicarFiltros(): void {
    let resultado = JSON.parse(JSON.stringify(this.datosOriginales));

    if (this.filtroClase) {
      resultado = resultado.filter((c: any) => c.nombre === this.filtroClase);
    }

    if (this.filtroFuncion) {
      resultado.forEach((clase: any) => {
        clase.specs = clase.specs.filter((s: any) => s.nombreFuncion === this.filtroFuncion);
      });
      resultado = resultado.filter((c: any) => c.specs.length > 0);
    }

    this.clasesConSpecs = resultado;
    this.cdr.detectChanges();
  }

  /**
   * Restablece los controles de filtrado a su estado inicial y 
   * recarga la lista completa de guías.
   * * @returns {void}
   */
  limpiarFiltros(): void {
    this.filtroClase = '';
    this.filtroFuncion = '';
    this.aplicarFiltros();
  }
  // #endregion

  // #region NAVEGACIÓN Y ENLACES EXTERNOS
  /**
   * Genera la URL dinámica hacia la guía correspondiente en Icy Veins.
   * Traduce los nombres de clases, especializaciones y funciones del español 
   * a los identificadores en inglés requeridos por el formato de URL de Icy Veins, 
   * abriendo el resultado en una nueva pestaña.
   * * @param {string} nombreClase - El nombre de la clase en español.
   * @param {string} nombreSpec - El nombre de la especialización en español.
   * @param {string} nombreFuncion - El rol de combate (Tanque, Sanador, DPS) en español.
   * @returns {void}
   */
  abrirGuiaIcyVeins(nombreClase: string, nombreSpec: string, nombreFuncion: string): void {
    const dictClases: any = {
      'Caballero de la Muerte': 'death-knight', 'Cazador': 'hunter', 'Cazador de Demonios': 'demon-hunter',
      'Chamán': 'shaman', 'Druida': 'druid', 'Evocador': 'evoker', 'Guerrero': 'warrior',
      'Mago': 'mage', 'Monje': 'monk', 'Paladín': 'paladin', 'Pícaro': 'rogue',
      'Sacerdote': 'priest', 'Brujo': 'warlock'
    };

    const dictSpecs: any = {
      'Sangre': 'blood', 'Escarcha': 'frost', 'Profano': 'unholy',
      'Bestias': 'beast-mastery', 'Puntería': 'marksmanship', 'Supervivencia': 'survival',
      'Devastación': 'havoc', 'Venganza': 'vengeance',
      'Elemental': 'elemental', 'Mejora': 'enhancement', 'Restauración': 'restoration',
      'Equilibrio': 'balance', 'Feral': 'feral', 'Guardián': 'guardian',
      'Aumento': 'augmentation', 'Preservación': 'preservation',
      'Armas': 'arms', 'Furia': 'fury', 'Protección': 'protection',
      'Arcano': 'arcane', 'Fuego': 'fire', 
      'Maestro Cervecero': 'brewmaster', 'Tejedor de Niebla': 'mistweaver', 'Viajero del Viento': 'windwalker',
      'Sagrado': 'holy', 'Reprensión': 'retribution', 
      'Asesinato': 'assassination', 'Forajido': 'outlaw', 'Sutileza': 'subtlety',
      'Disciplina': 'discipline', 'Sombras': 'shadow', 
      'Aflicción': 'affliction', 'Demonología': 'demonology', 'Destrucción': 'destruction'
    };

    const dictRoles: any = { 'Tanque': 'tank', 'Sanador': 'healing', 'DPS': 'dps' };

    const claseEng = dictClases[nombreClase] || nombreClase.toLowerCase().replace(/ /g, '-');
    const specEng = dictSpecs[nombreSpec] || nombreSpec.toLowerCase().replace(/ /g, '-');
    const rolEng = dictRoles[nombreFuncion] || 'dps';

    const urlGuia = `https://www.icy-veins.com/wow/${specEng}-${claseEng}-pve-${rolEng}-guide`;
    window.open(urlGuia, '_blank');
  }
  // #endregion
}