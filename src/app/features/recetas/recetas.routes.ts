import { Routes } from '@angular/router';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeDetailPageComponent } from './pages/recipe-detail-page/recipe-detail-page.component';

export const RECETAS_ROUTES: Routes = [
  {
    path: '',
    component: RecipeListComponent,
    title: 'Nuestras Recetas | GestorRecetas'
  },
    {
    path: ':id',
    component: RecipeDetailPageComponent,
    title: 'Detalle de Receta'
  }
];
