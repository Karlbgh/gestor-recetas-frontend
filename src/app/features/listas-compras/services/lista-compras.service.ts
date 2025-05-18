import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ListaCompra } from '../models/lista-compra.model';

@Injectable({
  providedIn: 'root'
})
export class ListaComprasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ListasCompras`; // Verifica el endpoint

  // Métodos CRUD (getAll, getById, create, update, delete)
  // ... (similar a RecetaService, usando el modelo ListaCompra)

  // generarListaDesdePlanificador(usuarioId: string, fechaInicio: Date, fechaFin: Date): Observable<ListaCompra> {
  //   return this.http.post<ListaCompra>(`${this.apiUrl}/generar-desde-planificador`, { usuarioId, fechaInicio, fechaFin })
  //     .pipe(catchError(this.handleError));
  // }

  private handleError(error: HttpErrorResponse) {
    console.error('Ocurrió un error en el servicio de ListaCompras:', error);
    return throwError(() => new Error('Error en ListaComprasService: ' + error.message));
  }
}
