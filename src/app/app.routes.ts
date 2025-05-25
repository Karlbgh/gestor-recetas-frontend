import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'recetas', pathMatch: 'full' },
      { path: 'recetas', loadChildren: () => import('./features/recetas/recetas.routes').then(m => m.RECETAS_ROUTES) },
      // Ejemplo para ingredientes (si tuvieras ingredientes.routes.ts):
      // {
      //   path: 'ingredientes',
      //   loadChildren: () => import('./features/ingredientes/ingredientes.routes').then(m => m.INGREDIENTES_ROUTES),
      //   // canActivate: [authGuard]
      // },
      // Ejemplo para listas de compras (si tuvieras listas-compras.routes.ts):
      // {
      //   path: 'listas-compras',
      //   loadChildren: () => import('./features/listas-compras/listas-compras.routes').then(m => m.LISTAS_COMPRAS_ROUTES),
      //   // canActivate: [authGuard]
      // },
      // Ejemplo para planificador (si tuvieras planificador.routes.ts):
      // {
      //   path: 'planificador',
      //   loadChildren: () => import('./features/planificador/planificador.routes').then(m => m.PLANIFICADOR_ROUTES),
      //   // canActivate: [authGuard]
      // },
      // Otras rutas que no requieren autenticación o usan otro layout irían fuera o dentro de otro path '' con otro componente layout
    ]
  },
  // { path: 'login', component: LoginComponent }, // Si tuvieras una ruta de login fuera del layout principal
  { path: '**', component: NotFoundComponent }
];
