import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PerfilUsuario } from '../models/perfil-usuario.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilUsuarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/PerfilUsuario`;

  /**
   * Obtiene el perfil del usuario actualmente autenticado.
   */
  getPerfil(): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualiza parcialmente el perfil del usuario.
   * @param perfil El objeto con los datos a actualizar (puede ser parcial).
   */
  updatePerfil(perfil: Partial<PerfilUsuario>): Observable<PerfilUsuario> {
    // Usamos PUT, pero podría ser PATCH si tu API lo soporta para actualizaciones parciales.
    return this.http.put<PerfilUsuario>(this.apiUrl, perfil)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Ocurrió un error en el servicio de PerfilUsuario:', error);
    let errorMessage = 'Error en el servicio de Perfil: ' + (error.error?.message || error.message);
    return throwError(() => new Error(errorMessage));
  }
}
