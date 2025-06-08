// src/app/features/ingredientes/services/ingrediente.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Ingrediente } from '../models/ingrediente.model';

@Injectable({
  providedIn: 'root'
})
export class IngredienteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Ingredientes`; //

  /**
   * Obtiene la lista COMPLETA de ingredientes desde el backend.
   * Llama al endpoint GET /api/Ingredientes.
   */
  getIngredientes(): Observable<Ingrediente[]> {
    return this.http.get<Ingrediente[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // El método searchIngredientes ya no es necesario, ya que filtraremos en el cliente.

  private handleError(error: HttpErrorResponse) {
    // console.error('Ocurrió un error en el servicio de Ingredientes:', error);
    return throwError(() => new Error('Error en IngredienteService: ' + error.message));
  }
}
