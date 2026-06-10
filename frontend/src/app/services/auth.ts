// #region IMPORTS
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// #endregion

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // #region CONFIGURACIÓN
  /** URL base para las peticiones a la API del servidor. */
  private apiUrl = 'http://192.168.1.130:8000/api'; 
  // #endregion

  // #region CONSTRUCTOR
  constructor(private http: HttpClient) {}
  // #endregion

  // #region LÓGICA DE AUTENTICACIÓN
  /**
   * Envía las credenciales al servidor para validar la sesión del usuario.
   * * @param credenciales - Objeto que contiene email y contraseña.
   * * @returns {Observable<any>} La respuesta del servidor con los datos de sesión.
   */
  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales);
  }

  /**
   * Envía los datos del formulario al servidor para crear una nueva cuenta de usuario.
   * * @param datos - Objeto con la información requerida para el registro.
   * * @returns {Observable<any>} La respuesta del servidor tras procesar el registro.
   */
  registrarUsuario(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, datos);
  }
  // #endregion
}