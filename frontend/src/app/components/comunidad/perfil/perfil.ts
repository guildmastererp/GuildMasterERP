// #region IMPORTS

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// #endregion

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.html',    /* Adaptado a tu perfil.html */
  styleUrls: ['./perfil.css'],     /* Adaptado a tu perfil.css */
  standalone: false
})
export class Perfil implements OnInit { /* Clase unificada como Perfil */

  // #region PROPIEDADES

  // Enlace dummy que posteriormente vendrá de tu base de datos en Laravel
  raiderIoLinkMock: string = 'https://raider.io/characters/eu/zuljin/Sylvanas'; 
  
  characterData: any = null;
  cargando: boolean = true;
  errorCarga: boolean = false;

  // #endregion

  // #region CONSTRUCTOR

  constructor(private http: HttpClient) {}

  // #endregion

  // #region METODOS

    // #region HOOKS
  ngOnInit(): void {
    this.cargarPerfilRaiderIo();
  }
    // #endregion

    // #region PROCESAMIENTO Y API
  /**
   * @description Descompone la URL de Raider.io para extraer Región, Reino y Personaje,
   * y posteriormente consume la API oficial para traer los datos en tiempo real.
   */
  cargarPerfilRaiderIo() {
    try {
      const urlParts = this.raiderIoLinkMock.split('/characters/')[1].split('/');
      const region = urlParts[0];
      const realm = urlParts[1];
      const name = urlParts[2];

      const apiUrl = `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${name}&fields=gear,mythic_plus_scores_by_season:current,raid_progression`;

      this.http.get(apiUrl).subscribe({
        next: (data: any) => {
          this.characterData = data;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al conectar con la API de Raider.io', err);
          this.errorCarga = true;
          this.cargando = false;
        }
      });
    } catch (e) {
      this.errorCarga = true;
      this.cargando = false;
    }
  }
    // #endregion

  // #endregion
}