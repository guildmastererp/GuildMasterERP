import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Registro } from './components/auth/registro/registro';
import { Layout } from './components/layout/layout/layout';
import { Perfil } from './components/comunidad/perfil/perfil';
import { Ranking } from './components/comunidad/ranking/ranking';
import { Buscador } from './components/comunidad/buscador/buscador';
import { Guias as GuiasComunidad } from './components/comunidad/guias/guias';
import { Organizacion } from './components/raid/organizacion/organizacion';
import { Roster } from './components/raid/roster/roster';
import { Loot } from './components/raid/loot/loot';
import { Registro as RegistroPiedras } from './components/miticas/registro/registro';
import { Guias as GuiasMiticas } from './components/miticas/guias/guias';
import { Tablon } from './components/eventos/tablon/tablon';
import { Inscripcion } from './components/eventos/inscripcion/inscripcion';
import { Ajustes } from './components/configuracion/ajustes/ajustes';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'registro', component: Registro },

  { 
    path: '', 
    component: Layout, 
    children: [
      { path: 'comunidad/perfil', component: Perfil },
      { path: 'comunidad/ranking', component: Ranking },
      { path: 'comunidad/buscador', component: Buscador },
      { path: 'comunidad/guias', component: GuiasComunidad },

      { path: 'raid/organizacion', component: Organizacion },
      { path: 'raid/roster', component: Roster },
      { path: 'raid/loot', component: Loot },

      { path: 'miticas/registro', component: RegistroPiedras },
      { path: 'miticas/guias', component: GuiasMiticas },

      { path: 'eventos/tablon', component: Tablon },
      { path: 'eventos/inscripcion', component: Inscripcion },

      { path: 'configuracion/ajustes', component: Ajustes }
    ]
  },
  
  { path: '**', redirectTo: '/login' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }