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

  getPerfil(id: string): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  updatePerfil(id: string, payload: UpdatePerfilPayload): Observable<PerfilUsuario> {
    return this.http.put<PerfilUsuario>(`${this.apiUrl}/${id}`, payload)
      .pipe(catchError(this.handleError));
  }

  deletePerfil(id: string): Observable<void> {
    // console.warn(`Soft delete del perfil de usuario con ID: ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    // console.error('Ocurrió un error en el servicio de PerfilUsuario:', error);
    return throwError(() => error);
  }
}
