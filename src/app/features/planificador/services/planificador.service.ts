import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Planificador, PlanComida } from '../models/planificador.model';

@Injectable({
  providedIn: 'root'
})
export class PlanificadorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Planificador`;

  addRecetaAPlan(plan: Planificador): Observable<Planificador> {
    return this.http.post<Planificador>(this.apiUrl, plan)
      .pipe(catchError(this.handleError));
  }


  private handleError(error: HttpErrorResponse) {
    // console.error('Ocurrió un error en el servicio de Planificador:', error);s
    return throwError(() => new Error('Error en PlanificadorService: ' + error.message));
  }
}
