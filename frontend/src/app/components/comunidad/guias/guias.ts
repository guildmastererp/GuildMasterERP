// #region IMPORTS
import { Component, OnInit } from '@angular/core';
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

  // #region PROPIEDADES DE DATOS
  clasesConSpecs: any[] = []; // Array principal agrupado para pintar la vista
  datosOriginales: any[] = []; // Copia de seguridad para los filtros

  auxClases: any[] = [];
  auxSpecs: any[] = [];
  auxFunciones: any[] = [];

  cargando: boolean = true;
  errorCarga: boolean = false;
  // #endregion

  // #region PROPIEDADES DE FILTRO
  filtroClase: string = '';
  filtroFuncion: string = '';
  // #endregion

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarDatosMaestros();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  // #region CARGA Y AGRUPACIÓN DE DATOS
  cargarDatosMaestros() {
    this.cargando = true;
    
    forkJoin({
      clases: this.http.get<any[]>('http://192.168.1.132:8000/api/aux-clases', { headers: this.getHeaders() }),
      specs: this.http.get<any[]>('http://192.168.1.132:8000/api/aux-specs', { headers: this.getHeaders() }),
      funciones: this.http.get<any[]>('http://192.168.1.132:8000/api/aux-funciones', { headers: this.getHeaders() })
    }).subscribe({
      next: (res) => {
        this.auxClases = res.clases;
        this.auxSpecs = res.specs;
        this.auxFunciones = res.funciones;
        
        this.agruparDatos();
        this.cargando = false;
      },
      error: () => {
        this.errorCarga = true;
        this.cargando = false;
      }
    });
  }

  agruparDatos() {
    // Creamos un array donde cada objeto es una Clase con sus Especializaciones dentro
    const agrupado = this.auxClases.map(clase => {
      
      // Buscamos las specs que pertenecen a esta clase
      const specsDeClase = this.auxSpecs.filter(s => s.codigoClase === clase.codigo).map(spec => {
        // Le adjuntamos el nombre de su función para poder filtrar
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

  // #region FILTRADO DE LA VISTA
  aplicarFiltros() {
    // Clonamos el array original para no perder datos
    let resultado = JSON.parse(JSON.stringify(this.datosOriginales));

    // 1. Filtrar por Clase entera
    if (this.filtroClase) {
      resultado = resultado.filter((c: any) => c.nombre === this.filtroClase);
    }

    // 2. Filtrar las specs internas por Función (Tanque, Healer, DPS)
    if (this.filtroFuncion) {
      resultado.forEach((clase: any) => {
        clase.specs = clase.specs.filter((s: any) => s.nombreFuncion === this.filtroFuncion);
      });
      // Quitamos las clases que se hayan quedado vacías tras filtrar sus specs
      resultado = resultado.filter((c: any) => c.specs.length > 0);
    }

    this.clasesConSpecs = resultado;
  }

  limpiarFiltros() {
    this.filtroClase = '';
    this.filtroFuncion = '';
    this.aplicarFiltros();
  }
  // #endregion

  // #region GENERADOR DE ENLACES A ICY VEINS
  abrirGuiaIcyVeins(nombreClase: string, nombreSpec: string, nombreFuncion: string) {
    // 1. Diccionarios de traducción Español -> Inglés
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
      'Arcano': 'arcane', 'Fuego': 'fire', // Escarcha ya está
      'Maestro Cervecero': 'brewmaster', 'Tejedor de Niebla': 'mistweaver', 'Viajero del Viento': 'windwalker',
      'Sagrado': 'holy', 'Reprensión': 'retribution', // Protección ya está
      'Asesinato': 'assassination', 'Forajido': 'outlaw', 'Sutileza': 'subtlety',
      'Disciplina': 'discipline', 'Sombras': 'shadow', // Sagrado ya está
      'Aflicción': 'affliction', 'Demonología': 'demonology', 'Destrucción': 'destruction'
    };

    const dictRoles: any = {
      'Tanque': 'tank',
      'Sanador': 'healing',
      'DPS': 'dps'
    };

    // 2. Extraemos los términos en inglés (o hacemos limpieza básica si no existen)
    const claseEng = dictClases[nombreClase] || nombreClase.toLowerCase().replace(/ /g, '-');
    const specEng = dictSpecs[nombreSpec] || nombreSpec.toLowerCase().replace(/ /g, '-');
    const rolEng = dictRoles[nombreFuncion] || 'dps'; // Por defecto dps

    // 3. Montamos la URL con el patrón oficial de Icy Veins
    // Ejemplo: https://www.icy-veins.com/wow/blood-death-knight-pve-tank-guide
    const urlGuia = `https://www.icy-veins.com/wow/${specEng}-${claseEng}-pve-${rolEng}-guide`;

    // 4. Abrimos en una nueva pestaña
    window.open(urlGuia, '_blank');
  }
  // #endregion
}