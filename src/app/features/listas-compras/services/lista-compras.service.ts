import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ListaCompra } from '../models/lista-compra.model';

@Injectable({
  providedIn: 'root'
})
export class ListaComprasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ListasCompras`;

  private handleError(error: HttpErrorResponse) {
    // console.error('Ocurrió un error en el servicio de ListaCompras:', error);
    return throwError(() => new Error('Error en ListaComprasService: ' + error.message));
  }
}
