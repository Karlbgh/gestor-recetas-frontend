import { Routes } from '@angular/router';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeDetailPageComponent } from './pages/recipe-detail-page/recipe-detail-page.component';
import { RecipeEditPageComponent } from './pages/recipe-edit-page/recipe-edit-page.component';
import { authGuard } from '../../core/guards/auth.guard';

export const RECETAS_ROUTES: Routes = [
  {
    path: '',
    component: RecipeListComponent,
    title: 'Nuestras Recetas | GestorRecetas'
  },
  {
    path: 'nueva',
    component: RecipeEditPageComponent,
    canActivate: [authGuard],
    title: 'Crear Nueva Receta'
  },
  {
    path: ':id/editar',
    component: RecipeEditPageComponent,
    canActivate: [authGuard],
    title: 'Editar Receta'
  },
  {
    path: ':id',
    component: RecipeDetailPageComponent,
    title: 'Detalle de Receta'
  },
];
