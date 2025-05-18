import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Ingrediente } from '../models/ingrediente.model';

@Injectable({
  providedIn: 'root'
})
export class IngredienteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Ingredientes`; // Verifica el endpoint

  // Métodos CRUD (getAll, getById, create, update, delete)
  // ... (similar a RecetaService, usando el modelo Ingrediente)

  private handleError(error: HttpErrorResponse) {
    console.error('Ocurrió un error en el servicio de Ingredientes:', error);
    return throwError(() => new Error('Error en IngredienteService: ' + error.message));
  }
}
