// #region IMPORTS

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componentes de Autenticación
import { Login } from './components/auth/login/login';
import { Registro } from './components/auth/registro/registro';

// Estructura Estructural Base
import { Layout } from './components/layout/layout/layout';

// Guarda de Seguridad (Funcional)
import { authGuard } from './guards/auth-guard'; 

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
import { RegistroMiticas as RegistroPiedras } from './components/miticas/registro/registro';
import { Guias as GuiasMiticas } from './components/miticas/guias/guias';

// Módulo de Eventos
import { Tablon } from './components/eventos/tablon/tablon';
import { Inscripcion } from './components/eventos/inscripcion/inscripcion';

// Módulo de Configuración
import { Ajustes } from './components/configuracion/ajustes/ajustes';

// #endregion

/**
 * @description Configuración de rutas principal.
 */
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },

  { 
    path: 'principal', 
    component: Layout, 
    canActivate: [authGuard],      // <-- PROTEGE LA RUTA PADRE
    canActivateChild: [authGuard], // <-- PROTEGE EL ACCESO DIRECTO A LAS HIJAS
    children: [
      // Sub-rutas de Comunidad
      { path: 'comunidad/perfil', component: Perfil },
      { path: 'comunidad/ranking', component: Ranking },
      { path: 'comunidad/buscador', component: Buscador },
      { path: 'comunidad/guias', component: GuiasComunidad },
      { path: 'comunidad/gestion-puntos', component: GestionPuntos },

      // Sub-rutas de Raid
      { path: 'raid/organizacion', component: Organizacion },
      { path: 'raid/roster', component: Roster },
      { path: 'raid/loot', component: Loot },

      // Sub-rutas de Míticas+
      { path: 'miticas/registro', component: RegistroPiedras },
      { path: 'miticas/guias', component: GuiasMiticas },

      // Sub-rutas de Eventos
      { path: 'eventos/tablon', component: Tablon },
      { path: 'eventos/inscripcion', component: Inscripcion },

      // Sub-rutas de Configuración
      { path: 'configuracion/ajustes', component: Ajustes }
    ]
  },
  
  { path: '**', redirectTo: '/login' }
];

// #region MÓDULO DE ENRUTAMIENTO
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
// #endregion