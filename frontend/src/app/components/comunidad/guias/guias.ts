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

  // CORRECCIÓN: Inyección de ChangeDetectorRef
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

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
        // CORRECCIÓN: Forzar el repintado de la vista
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorCarga = true;
        this.cargando = false;
        // CORRECCIÓN: Forzar el repintado de la vista
        this.cdr.detectChanges();
      }
    });
  }

  agruparDatos() {
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
  aplicarFiltros() {
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

  limpiarFiltros() {
    this.filtroClase = '';
    this.filtroFuncion = '';
    this.aplicarFiltros();
  }
  // #endregion

  abrirGuiaIcyVeins(nombreClase: string, nombreSpec: string, nombreFuncion: string) {
    // Igual que el tuyo, solo abriendo en nueva pestaña
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
}