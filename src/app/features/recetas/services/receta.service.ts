import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, delay, map } from 'rxjs/operators';
import { Receta, UsuarioSimple } from '../models/receta.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Recetas`; // Endpoint de tu API para recetas

  constructor() { }

  getRecetas(): Observable<Receta[]> {
    console.log(`Solicitando recetas desde: ${this.apiUrl}`);

    return this.http.get<Receta[]>(this.apiUrl).pipe(
      tap(recetasTransformadas => {
        console.log('Recetas recibidas y transformadas:', recetasTransformadas);
      }),
      catchError(this.handleError)
    );
  }

  // Obtener una receta por ID de receta
  getRecetaById(id: string): Observable<Receta> {
    return this.http.get<Receta>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene todas las recetas creadas por un usuario específico.
   * @param usuarioId El ID del usuario.
   * @returns Un Observable con un array de Recetas.
   */
  getRecetasByUsuario(usuarioId: string): Observable<Receta[]> {
    // Se utiliza el endpoint GET /api/Recetas/{id}, donde {id} es el ID del usuario.
    return this.http.get<Receta[]>(`${this.apiUrl}/usuario/${usuarioId}`)
      .pipe(catchError(this.handleError));
  }

  // Crear una nueva receta
  createReceta(receta: Receta): Observable<Receta> {
    return this.http.post<Receta>(this.apiUrl, receta)
      .pipe(catchError(this.handleError));
  }

  // Actualizar una receta existente
  updateReceta(id: string, receta: Receta): Observable<Receta> {
    return this.http.put<Receta>(`${this.apiUrl}/${id}`, receta)
      .pipe(catchError(this.handleError));
  }

  // Eliminar una receta
  deleteReceta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Funcionalidades de Búsqueda y Filtrado (Ejemplo)
  // buscarRecetas(termino: string, dificultad?: string, ...): Observable<Receta[]> {
  //   let params = new HttpParams().set('nombre', termino);
  //   if (dificultad) {
  //     params = params.set('dificultad', dificultad);
  //   }
  //   // ... otros parámetros
  //   return this.http.get<Receta[]>(`${this.apiUrl}/buscar`, { params }) // Asumiendo un endpoint /buscar
  //     .pipe(catchError(this.handleError));
  // }

  // Manejo de errores básico
  private handleError(error: HttpErrorResponse) {
    console.error('Ocurrió un error en el servicio de Recetas:', error);
    let errorMessage = 'Algo salió mal; por favor, inténtalo de nuevo más tarde.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Código: ${error.status}\nMensaje: ${error.message}`;
      if (error.error && typeof error.error === 'string') {
        errorMessage += `\nDetalle: ${error.error}`;
      } else if (error.error && error.error.errors) {
        const errors = Object.values(error.error.errors).flat();
        errorMessage += `\nDetalles: ${errors.join(', ')}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
