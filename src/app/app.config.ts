import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, withInterceptors } from '@angular/common/http'; // Importa provideHttpClient y withInterceptorsFromDi
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from './core/interceptors/auth.interceptor'; // Ajusta la ruta

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()), // Añade provideHttpClient aquí
     provideHttpClient(withInterceptors([authInterceptor]))
    // Si vas a usar interceptores funcionales, podrías añadirlos directamente aquí.
    // Ejemplo: provideHttpClient(withInterceptors([loggingInterceptor, cachingInterceptor]))
  ]
};
