import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';

// Importación del componente principal
import { AppComponent } from './app';

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
import { GestionPuntos } from './components/comunidad/gestion-puntos/gestion-puntos';


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

// Configuración
import { Ajustes } from './components/configuracion/ajustes/ajustes';

@NgModule({
  declarations: [
    AppComponent,
    Login,
    Registro,
    Layout,
    Perfil,
    Ranking,
    Buscador,
    GuiasComunidad,
    Organizacion,
    Roster,
    Loot,
    RegistroPiedras,
    GuiasMiticas,
    Tablon,
    Inscripcion,
    Ajustes,
    GestionPuntos,
    
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [provideHttpClient(withFetch())],
  bootstrap: [AppComponent],
})
export class AppModule {}
