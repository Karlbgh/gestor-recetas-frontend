import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { AuthPageComponent } from './features/auth/pages/auth-page/auth-page.component';
import { ForgotPasswordPageComponent } from './features/auth/pages/forgot-password-page/forgot-password-page.component';
import { UpdatePasswordPageComponent } from './features/auth/pages/update-password-page/update-password-page.component';
import { authGuard } from './core/guards/auth.guard';
import { MisRecetasPageComponent } from './features/recetas/pages/mis-recetas-page/mis-recetas-page.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'recetas',
        pathMatch: 'full',
      },
      {
        path: 'recetas',
        loadChildren: () => import('./features/recetas/recetas.routes').then( (m) => m.RECETAS_ROUTES ),
      },
      {
        path: 'mis-recetas',
        component: MisRecetasPageComponent,
        canActivate: [authGuard],
        title: 'Mis Recetas'
      },
      {
        path: 'usuario',
        loadChildren: () => import('./features/usuarios/usuarios.routes').then( (m) => m.USUARIOS_ROUTES),
      }
    ]
  },
  // Rutas de Autenticación
  { path: 'auth', component: AuthPageComponent },
  { path: 'forgot-password', component: ForgotPasswordPageComponent, title: 'Recuperar Contraseña' },
  { path: 'update-password', component: UpdatePasswordPageComponent, title: 'Actualizar Contraseña' },

  // Rutas sin layout principal
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' }
];
