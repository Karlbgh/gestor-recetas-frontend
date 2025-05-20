import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'recetas',
        pathMatch: 'full'
      },
      {
        path: 'recetas',
        children: [
          {
            path: '', // Corresponde a /recetas
            loadComponent: () => import('./features/recetas/recetas-list.component').then(m => m.RecetasListComponent),
            data: { title: 'Lista de Recetas' }
          },
          {
            path: 'nueva', // Corresponde a /recetas/nueva
            loadComponent: () => import('./features/recetas/receta-form/receta-form.component').then(m => m.RecetaFormComponent),
            data: { title: 'Nueva Receta', mode: 'create' }
          },
          {
            path: ':id', // Corresponde a /recetas/:id (detalle)
            loadComponent: () => import('./features/recetas/receta-detail/receta-detail.component').then(m => m.RecetaDetailComponent),
            data: { title: 'Detalle de Receta' }
          },
          {
            path: ':id/editar', // Corresponde a /recetas/:id/editar
            loadComponent: () => import('./features/recetas/receta-form/receta-form.component').then(m => m.RecetaFormComponent),
            data: { title: 'Editar Receta', mode: 'edit' }
          }
        ]
      },
      {
        path: 'ingredientes',
        loadComponent: () =>
          import('./features/ingredientes/ingredientes-list.component').then(m => m.IngredientesListComponent),
      },
      {
        path: 'listas-compras',
        loadComponent: () =>
          import('./features/listas-compras/listas-compras-list.component').then(m => m.ListasComprasListComponent),
      },
      {
        path: 'planificador',
        loadComponent: () =>
          import('./features/planificador/planificador-view.component').then(m => m.PlanificadorViewComponent),
      },
      // {
      //   path: 'perfil-usuario',
      //   loadComponent: () =>
      //     import('./features/usuarios/perfil/perfil.component').then(m => m.PerfilComponent),
      // },

      // Más rutas de features irán aquí
      // ...
    ]
  },
  // Rutas que no usan MainLayoutComponent (ej. login, register, not-found)
  // {
  //   path: 'login',
  //   loadComponent: () => import('./core/auth/login/login.component').then(m => m.LoginComponent)
  // },
  {
    path: '**', // Wildcard route para página no encontrada
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
