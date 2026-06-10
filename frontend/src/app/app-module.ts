import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router'; 

// Componente Raíz
import { AppComponent } from './app';

// Guards
import { authGuard } from './guards/auth-guard';

// Componentes de Autenticación
import { Login } from './components/auth/login/login';
import { Registro as RegistroAuth } from './components/auth/registro/registro';

// Estructura Base
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
import { RegistroMiticas } from './components/miticas/registro/registro';
import { Guias as GuiasMiticas } from './components/miticas/guias/guias';

// Módulo de Eventos
import { Tablon } from './components/eventos/tablon/tablon';
import { Inscripcion } from './components/eventos/inscripcion/inscripcion';

// Módulo de Configuración
import { Ajustes } from './components/configuracion/ajustes/ajustes';

// CONFIGURACIÓN DE RUTAS
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: RegistroAuth },
  { 
    path: 'principal', 
    component: Layout, 
    canActivate: [authGuard],
    children: [
      { path: 'comunidad/perfil', component: Perfil },
      { path: 'comunidad/ranking', component: Ranking },
      { path: 'comunidad/buscador', component: Buscador },
      { path: 'comunidad/guias', component: GuiasComunidad },
      { path: 'comunidad/gestion-puntos', component: GestionPuntos },
      { path: 'raid/organizacion', component: Organizacion },
      { path: 'raid/roster', component: Roster },
      { path: 'raid/loot', component: Loot },
      { path: 'miticas/registro', component: RegistroMiticas },
      { path: 'miticas/guias', component: GuiasMiticas },
      { path: 'eventos/tablon', component: Tablon },
      { path: 'eventos/inscripcion', component: Inscripcion },
      { path: 'configuracion/ajustes', component: Ajustes }
    ]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  declarations: [
    AppComponent,
    Login,
    RegistroAuth,
    Layout,
    Perfil,
    Ranking,
    Buscador,
    GuiasComunidad,
    GestionPuntos,
    Organizacion,
    Roster,
    Loot,
    RegistroMiticas, 
    GuiasMiticas,
    Tablon,
    Inscripcion,
    Ajustes
  ],
  imports: [
    BrowserModule,
    FormsModule,      
    HttpClientModule,  
    RouterModule.forRoot(routes) 
  ],
  providers: [],
  bootstrap: [AppComponent] 
})
export class AppModule { }