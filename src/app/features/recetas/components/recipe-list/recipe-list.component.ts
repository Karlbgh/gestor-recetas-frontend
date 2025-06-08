import { Component, OnInit, inject, signal, ChangeDetectionStrategy, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Receta } from '../../models/receta.model';
import { RecetaService } from '../../services/receta.service';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent],
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeListComponent implements OnInit {
  private recetaService = inject(RecetaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // Inyectamos ActivatedRoute

  recetas: WritableSignal<Receta[]> = signal([]);
  isLoading: WritableSignal<boolean> = signal(true);
  errorMensaje: WritableSignal<string | null> = signal(null);

  ngOnInit(): void {
    // Escuchamos cambios en los parámetros de la URL
    this.route.queryParamMap.pipe(
      switchMap(params => {
        const searchTerm = params.get('search');
        this.isLoading.set(true);
        this.errorMensaje.set(null);
        this.recetas.set([]); // Limpiamos las recetas anteriores

        if (searchTerm) {
          // Si hay un término de búsqueda, llamamos a searchRecetas
          return this.recetaService.searchRecetas(searchTerm);
        } else {
          // Si no, llamamos a getRecetas para obtener todas
          return this.recetaService.getRecetas();
        }
      })
    ).subscribe({
      next: (data) => {
        this.recetas.set(data);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        console.error('Error al cargar recetas:', error);
        this.errorMensaje.set(`No se pudieron cargar las recetas. ${error.message}`);
        this.isLoading.set(false);
      },
    });
  }

  onVerDetalleReceta(recetaId: string | number): void {
    this.router.navigate(['/recetas', recetaId]);
  }

  // La lógica de onToggleFavoritoReceta se mantiene igual, aunque necesitaría
  // una implementación en el servicio si quieres persistir los favoritos.
  onToggleFavoritoReceta(event: { id: string | number; esFavorito: boolean }): void {
    console.log('Toggle favorito (sin implementar en backend):', event);
  }
}
