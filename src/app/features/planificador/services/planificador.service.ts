import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Planificador, PlanComida } from '../models/planificador.model'; // Ajusta el modelo

@Injectable({
  providedIn: 'root'
})
export class PlanificadorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Planificador`; // Verifica el endpoint

  // Obtener planificación para un usuario y rango de fechas
  // getPlanificacion(usuarioId: string, fechaInicio: Date, fechaFin: Date): Observable<Planificador[]> {
  //   let params = new HttpParams()
  //     .set('usuarioId', usuarioId)
  //     .set('fechaInicio', fechaInicio.toISOString())
  //     .set('fechaFin', fechaFin.toISOString());
  //   return this.http.get<Planificador[]>(this.apiUrl, { params })
  //     .pipe(catchError(this.handleError));
  // }

  // Añadir una receta al planificador
  addRecetaAPlan(plan: Planificador): Observable<Planificador> {
    return this.http.post<Planificador>(this.apiUrl, plan)
      .pipe(catchError(this.handleError));
  }

  // Actualizar una entrada del planificador
  // updatePlan(id: string, plan: Planificador): Observable<Planificador> {
  //   return this.http.put<Planificador>(`${this.apiUrl}/${id}`, plan)
  //     .pipe(catchError(this.handleError));
  // }

  // Eliminar una receta del planificador
  // removeRecetaDelPlan(id: string): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/${id}`)
  //     .pipe(catchError(this.handleError));
  // }

  private handleError(error: HttpErrorResponse) {
    console.error('Ocurrió un error en el servicio de Planificador:', error);
    return throwError(() => new Error('Error en PlanificadorService: ' + error.message));
  }
}
