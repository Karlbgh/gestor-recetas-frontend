import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Ingrediente } from '../models/ingrediente.model';

@Injectable({
  providedIn: 'root'
})
export class IngredienteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Ingredientes`;

  searchIngredientes(term: string): Observable<Ingrediente[]> {
    if (!term.trim()) {
      return new Observable(observer => observer.next([]));
    }
    const params = new HttpParams().set('nombre', term);

    return this.http.get<Ingrediente[]>(`${this.apiUrl}/buscar`, { params })
      .pipe(catchError(this.handleError));
  }


  private handleError(error: HttpErrorResponse) {
    console.error('Ocurrió un error en el servicio de Ingredientes:', error);
    return throwError(() => new Error('Error en IngredienteService: ' + error.message));
  }
}
