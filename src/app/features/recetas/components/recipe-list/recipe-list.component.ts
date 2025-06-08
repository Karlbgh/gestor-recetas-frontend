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
  private route = inject(ActivatedRoute);

  recetas: WritableSignal<Receta[]> = signal([]);
  isLoading: WritableSignal<boolean> = signal(true);
  errorMensaje: WritableSignal<string | null> = signal(null);

  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      switchMap(params => {
        const searchTerm = params.get('search');
        this.isLoading.set(true);
        this.errorMensaje.set(null);
        this.recetas.set([]);

        if (searchTerm) {
          return this.recetaService.searchRecetas(searchTerm);
        } else {
          return this.recetaService.getRecetas();
        }
      })
    ).subscribe({
      next: (data) => {
        this.recetas.set(data);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        // console.error('Error al cargar recetas:', error);
        this.errorMensaje.set(`No se pudieron cargar las recetas. ${error.message}`);
        this.isLoading.set(false);
      },
    });
  }

  onVerDetalleReceta(recetaId: string | number): void {
    this.router.navigate(['/recetas', recetaId]);
  }

  onToggleFavoritoReceta(event: { id: string | number; esFavorito: boolean }): void {
    // console.log('Toggle favorito (sin implementar en backend):', event);
  }
}
