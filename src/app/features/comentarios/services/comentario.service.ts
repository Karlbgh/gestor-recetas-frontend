import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Comentario } from '../models/comentario.model';

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Comentarios`;

  getComentariosPorReceta(recetaId: string): Observable<Comentario[]> {
    const params = new HttpParams().set('recetaId', recetaId);
    return this.http.get<Comentario[]>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  createComentario(comentario: Comentario): Observable<Comentario> {
    return this.http.post<Comentario>(this.apiUrl, comentario)
      .pipe(catchError(this.handleError));
  }


  private handleError(error: HttpErrorResponse) {
    // console.error('Ocurrió un error en el servicio de Comentarios:', error);
    return throwError(() => new Error('Error en ComentarioService: ' + error.message));
  }
}
