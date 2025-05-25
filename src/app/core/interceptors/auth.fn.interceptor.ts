import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service'; // Asegúrate que la ruta sea correcta

export const authInterceptorFn: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService); // Inyecta AuthService usando inject()
  const authToken = authService.getToken(); // Asume que tienes un método getToken() en AuthService

  // Clona la solicitud para agregar el nuevo encabezado.
  // Solo añade el token si existe.
  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return next(authReq);
  }

  // Si no hay token, pasa la solicitud original.
  return next(req);
};
