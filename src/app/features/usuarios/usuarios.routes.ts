import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { PerfilPageComponent } from './page/perfil-page/perfil-page.component';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard], // Proteger todas las rutas de usuario
    children: [
      {
        path: 'perfil',
        component: PerfilPageComponent,
        title: 'Mi Perfil | GestorRecetas'
      },
      // Puedes añadir más rutas de usuario aquí, como 'mis-recetas'
      {
        path: '',
        redirectTo: 'perfil',
        pathMatch: 'full'
      }
    ]
  }
];
