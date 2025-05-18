import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PerfilUsuario } from '../models/perfil-usuario.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilUsuarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/PerfilUsuario`; // Verifica el endpoint

  // Métodos (getPerfil, updatePerfil)
  // ... (adaptar a tus endpoints de PerfilUsuarioController)

  private handleError(error: HttpErrorResponse) {
    console.error('Ocurrió un error en el servicio de PerfilUsuario:', error);
    return throwError(() => new Error('Error en PerfilUsuarioService: ' + error.message));
  }
}
