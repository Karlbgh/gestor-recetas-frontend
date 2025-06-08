import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Receta, RecetaIngrediente } from '../models/receta.model';
import { environment } from '../../../../environments/environment';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {
  private http = inject(HttpClient);
  private dotnetApiUrl = `${environment.apiUrl}/Recetas`;

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  getRecetas(): Observable<Receta[]> {
    // console.log(`Solicitando todas las recetas desde Supabase con datos del creador`);
    const promise = this.supabase
      .from('receta')
      .select(`
        *,
        perfil_usuario (
          nombre
        )
      `)
      .order('nombre', { ascending: true });

    return from(promise).pipe(
      map(response => {
        if (response.error) {
          throw response.error;
        }
        return response.data.map((item: any) => ({
          ...item,
          idReceta: item.id,
          tiempoPreparacion: item.tiempo_preparacion,
          nombreCreador: item.perfil_usuario?.nombre || 'Anónimo',
        })) as Receta[];
      }),
      catchError(this.handleSupabaseError)
    );
  }

  searchRecetas(termino: string): Observable<Receta[]> {
    // console.log(`Buscando recetas en Supabase con el término: "${termino}"`);
    const promise = this.supabase.rpc('search_recipes', { search_term: termino });

    return from(promise).pipe(
      map(response => {
        if (response.error) {
          throw response.error;
        }
        return response.data.map((item: any) => ({
          ...item,
          idReceta: item.id,
          tiempoPreparacion: item.tiempo_preparacion,
          nombreCreador: item.perfil_usuario?.nombre || 'Anónimo',
        })) as Receta[];
      }),
      catchError(this.handleSupabaseError)
    );
  }

  getRecetaById(id: string): Observable<Receta> {
    return this.http.get<Receta>(`${this.dotnetApiUrl}/${id}`)
      .pipe(catchError(this.handleHttpError));
  }

  getIngredientesPorReceta(recetaId: string): Observable<RecetaIngrediente[]> {
    return this.http.get<RecetaIngrediente[]>(`${this.dotnetApiUrl}/${recetaId}/ingredientes`)
      .pipe(catchError(this.handleHttpError));
  }

  getRecetasByUsuario(usuarioId: string): Observable<Receta[]> {
    return this.http.get<Receta[]>(`${this.dotnetApiUrl}/usuario/${usuarioId}`)
      .pipe(catchError(this.handleHttpError));
  }

  createReceta(receta: Receta): Observable<Receta> {
    return this.http.post<Receta>(this.dotnetApiUrl, receta)
      .pipe(catchError(this.handleHttpError));
  }

  updateReceta(id: string, receta: Receta): Observable<void> {
    return this.http.put<void>(`${this.dotnetApiUrl}/${id}`, receta)
      .pipe(catchError(this.handleHttpError));
  }

  deleteReceta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.dotnetApiUrl}/${id}`)
      .pipe(catchError(this.handleHttpError));
  }

  private handleSupabaseError(error: any) {
    // console.error('Ocurrió un error en la llamada a Supabase:', error);
    return throwError(() => new Error(error.message || 'Error desconocido del servidor de Supabase.'));
  }

  private handleHttpError(error: HttpErrorResponse) {
    // console.error('Ocurrió un error en el servicio HTTP de Recetas:', error);
    let errorMessage = 'Algo salió mal; por favor, inténtalo de nuevo más tarde.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Código: ${error.status}\nMensaje: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
