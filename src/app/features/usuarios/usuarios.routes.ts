import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { PerfilPageComponent } from './page/perfil-page/perfil-page.component';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'perfil',
        component: PerfilPageComponent,
        title: 'Mi Perfil | GestorRecetas'
      },
      {
        path: '',
        redirectTo: 'perfil',
        pathMatch: 'full'
      }
    ]
  }
];
