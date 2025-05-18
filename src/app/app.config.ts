import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; // Importa provideHttpClient y withInterceptorsFromDi
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()), // Añade provideHttpClient aquí
    // Si vas a usar interceptores funcionales, podrías añadirlos directamente aquí.
    // Ejemplo: provideHttpClient(withInterceptors([loggingInterceptor, cachingInterceptor]))
  ]
};
