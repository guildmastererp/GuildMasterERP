// #region IMPORTS

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componentes de Autenticación
import { Login } from './components/auth/login/login';
import { Registro } from './components/auth/registro/registro';

// Estructura Estructural Base
import { Layout } from './components/layout/layout/layout';

// Módulo de Comunidad
import { Perfil } from './components/comunidad/perfil/perfil';
import { Ranking } from './components/comunidad/ranking/ranking';
import { Buscador } from './components/comunidad/buscador/buscador';
import { Guias as GuiasComunidad } from './components/comunidad/guias/guias';
import { GestionPuntos } from './components/comunidad/gestion-puntos/gestion-puntos'; 

// Módulo de Raid
import { Organizacion } from './components/raid/organizacion/organizacion';
import { Roster } from './components/raid/roster/roster';
import { Loot } from './components/raid/loot/loot';

// Módulo de Míticas
// CORRECCIÓN AQUÍ: Importamos RegistroMiticas (el nombre real de la clase)
import { RegistroMiticas as RegistroPiedras } from './components/miticas/registro/registro';
import { Guias as GuiasMiticas } from './components/miticas/guias/guias';

// Módulo de Eventos
import { Tablon } from './components/eventos/tablon/tablon';
import { Inscripcion } from './components/eventos/inscripcion/inscripcion';

// Módulo de Configuración
import { Ajustes } from './components/configuracion/ajustes/ajustes';

// #endregion

// #region CONFIGURACIÓN DE RUTAS

const routes: Routes = [
  // #region 1. REDIRECCIÓN INICIAL
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // #endregion

  // #region 2. MUNDO PÚBLICO (AUTENTICACIÓN)
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  // #endregion

  // #region 3. MUNDO PRIVADO (SISTEMA ERP ENVOLVIO EN EL LAYOUT)
  { 
    path: 'principal', 
    component: Layout, 
    children: [
      // #region SUB-RUTAS DE COMUNIDAD
      { path: 'comunidad/perfil', component: Perfil },
      { path: 'comunidad/ranking', component: Ranking },
      { path: 'comunidad/buscador', component: Buscador },
      { path: 'comunidad/guias', component: GuiasComunidad },
      { path: 'comunidad/gestion-puntos', component: GestionPuntos },
      // #endregion

      // #region SUB-RUTAS DE RAID
      { path: 'raid/organizacion', component: Organizacion },
      { path: 'raid/roster', component: Roster },
      { path: 'raid/loot', component: Loot },
      // #endregion

      // #region SUB-RUTAS DE MÍTICAS+
      { path: 'miticas/registro', component: RegistroPiedras },
      { path: 'miticas/guias', component: GuiasMiticas },
      // #endregion

      // #region SUB-RUTAS DE EVENTOS
      { path: 'eventos/tablon', component: Tablon },
      { path: 'eventos/inscripcion', component: Inscripcion },
      // #endregion

      // #region SUB-RUTAS DE CONFIGURACIÓN
      { path: 'configuracion/ajustes', component: Ajustes }
      // #endregion
    ]
  },
  // #endregion
  
  // #region 4. COMODÍN DE SEGURIDAD
  { path: '**', redirectTo: '/login' }
  // #endregion
];

// #endregion

// #region ANGULAR MODULE DEFINITION

/**
 * @description Módulo de enrutamiento central de GuildMasterERP.
 * Organiza la carga de submódulos dinámicos respetando el contenedor estructural del Layout.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// #endregion