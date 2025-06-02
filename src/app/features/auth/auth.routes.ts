import { Routes } from '@angular/router';
import { AuthPageComponent } from './pages/auth-page/auth-page.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '/auth', // La ruta base para la autenticación (ej: /auth)
    component: AuthPageComponent
  },
  // Podrías añadir más rutas específicas de autenticación aquí si fuera necesario
  // como /auth/forgot-password, etc.
];
