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

  // Obtener todas las recetas (con posible paginación o filtros)
  getRecetas(): Observable<Receta[]> {
    console.log(`Solicitando recetas desde: ${this.apiUrl}`);

    return this.http.get<Receta[]>(this.apiUrl).pipe(
      // map(recetas => recetas.map(receta => this.transformarReceta(receta))),
      tap(recetasTransformadas => {
        // Log para verificar los datos transformados (opcional)
        console.log('Recetas recibidas y transformadas:', recetasTransformadas);
      }),
      catchError(this.handleError)
    );
  }

  // Obtener una receta por ID
  getRecetaById(id: string): Observable<Receta> {
    return this.http.get<Receta>(`${this.apiUrl}/${id}`)
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
  deleteReceta(id: string): Observable<void> { // O Observable<any>
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
    // Aquí podrías enviar el error a un servicio de logging remoto
    console.error('Ocurrió un error en el servicio de Recetas:', error);
    // Podrías personalizar el mensaje de error basado en error.status
    let errorMessage = 'Algo salió mal; por favor, inténtalo de nuevo más tarde.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El backend devolvió un código de respuesta insatisfactorio.
      // El cuerpo de la respuesta puede contener pistas sobre qué salió mal.
      errorMessage = `Error Código: ${error.status}\nMensaje: ${error.message}`;
      if (error.error && typeof error.error === 'string') {
        errorMessage += `\nDetalle: ${error.error}`;
      } else if (error.error && error.error.errors) { // Para errores de validación de ASP.NET Core
        const errors = Object.values(error.error.errors).flat();
        errorMessage += `\nDetalles: ${errors.join(', ')}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
