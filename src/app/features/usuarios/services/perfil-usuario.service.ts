// src/app/features/usuarios/services/perfil-usuario.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PerfilUsuario, UpdatePerfilPayload } from '../models/perfil-usuario.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilUsuarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/PerfilUsuario`;

  /**
   * Obtiene el perfil de un usuario por su ID.
   * @param id El ID del usuario.
   */
  getPerfil(id: string): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualiza parcialmente el perfil del usuario (solo nombre y/o fotoPerfil).
   * @param id El ID del usuario a actualizar.
   * @param payload El objeto con los datos a actualizar.
   */
  updatePerfil(id: string, payload: UpdatePerfilPayload): Observable<PerfilUsuario> {
    return this.http.put<PerfilUsuario>(`${this.apiUrl}/${id}`, payload)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Ocurrió un error en el servicio de PerfilUsuario:', error);
    let errorMessage = 'Error en el servicio de Perfil: ' + (error.error?.message || error.message);
    return throwError(() => new Error(errorMessage));
  }
}
