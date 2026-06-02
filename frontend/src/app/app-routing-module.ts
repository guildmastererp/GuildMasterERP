import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Auth
import { Login } from './components/auth/login/login';
import { Registro } from './components/auth/registro/registro';

// Layout
import { Layout } from './components/layout/layout/layout';

// Comunidad
import { Perfil } from './components/comunidad/perfil/perfil';
import { Ranking } from './components/comunidad/ranking/ranking';
import { Buscador } from './components/comunidad/buscador/buscador';
import { Guias as GuiasComunidad } from './components/comunidad/guias/guias';

// Raid
import { Organizacion } from './components/raid/organizacion/organizacion';
import { Roster } from './components/raid/roster/roster';
import { Loot } from './components/raid/loot/loot';

// Miticas
import { Registro as RegistroPiedras } from './components/miticas/registro/registro';
import { Guias as GuiasMiticas } from './components/miticas/guias/guias';

// Eventos
import { Tablon } from './components/eventos/tablon/tablon';
import { Inscripcion } from './components/eventos/inscripcion/inscripcion';

// Configuracion
import { Ajustes } from './components/configuracion/ajustes/ajustes';

const routes: Routes = [
  // 1. Redirección inicial obligatoria: si entras a localhost:4200, vas al login
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // 2. Mundo Público (Autenticación)
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },

  // 3. Mundo Privado (El ERP envuelto en el Layout, ahora colgando de /principal)
  { 
    path: 'principal', 
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
  
  // 4. Comodín de seguridad (Si escribes una ruta que no existe, te manda al login)
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }