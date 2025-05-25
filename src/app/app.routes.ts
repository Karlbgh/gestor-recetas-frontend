import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      // {
      //   path: 'inicio',
      //   loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) // Ejemplo de página de inicio
      // },
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
// Rutas sin layout principal (ej. página de error específica)
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' } // Wildcard route para 404
];
