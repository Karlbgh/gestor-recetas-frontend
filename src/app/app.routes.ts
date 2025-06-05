import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { AuthPageComponent } from './features/auth/pages/auth-page/auth-page.component';
import { ForgotPasswordPageComponent } from './features/auth/pages/forgot-password-page/forgot-password-page.component';
import { UpdatePasswordPageComponent } from './features/auth/pages/update-password-page/update-password-page.component';

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
        // canActivate: [authGuard],
      },
      // {
      //   path: 'recetas',
      //   loadChildren: () => import('./features/recetas/recetas.routes').then(m => m.RECETAS_ROUTES)
      // },
      // // Rutas de autenticación (ejemplo, podrían estar en su propio módulo de rutas)
      // {
      //   path: 'login',
      //   loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      // },
      // {
      //   path: 'registro',
      //   loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      // },
      // {
      //   path: 'perfil',
      //   loadComponent: () => import('./features/usuarios/perfil/perfil.component').then(m => m.PerfilComponent),
      //   // canActivate: [AuthGuard] // Proteger ruta de perfil
      // },
      // {
      //   path: 'recetas/buscar', // Ruta para mostrar resultados de búsqueda
      //   loadComponent: () => import('./features/recetas/pages/receta-search-results/receta-search-results.component').then(m => m.RecetaSearchResultsComponent)
      // }
    ]
  },
 // Rutas de Autenticación
  { path: 'auth', component: AuthPageComponent },
  { path: 'forgot-password', component: ForgotPasswordPageComponent, title: 'Recuperar Contraseña' },
  // Esta ruta debe estar en la raíz para que Supabase la encuentre fácilmente
  { path: 'update-password', component: UpdatePasswordPageComponent, title: 'Actualizar Contraseña' },

// Rutas sin layout principal (ej. página de error específica)
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' }
];
