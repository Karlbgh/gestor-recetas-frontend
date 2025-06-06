import { Component, OnInit, inject, signal, ChangeDetectionStrategy, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Receta } from '../../models/receta.model';
import { RecetaService } from '../../services/receta.service';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component'; // Ruta actualizada
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent], // RecipeCardComponent importado
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeListComponent implements OnInit {
  private recetaService = inject(RecetaService);
  private router = inject(Router);

  recetas: WritableSignal<Receta[]> = signal([]);
  isLoading: WritableSignal<boolean> = signal(true);
  errorMensaje: WritableSignal<string | null> = signal(null);

  ngOnInit(): void {
    this.cargarRecetas();
  }

  cargarRecetas(): void {
    this.isLoading.set(true);
    this.errorMensaje.set(null);
    this.recetaService.getRecetas().subscribe({
      next: (data) => {
        this.recetas.set(data);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        console.error('Error al cargar recetas:', error);
        this.errorMensaje.set(`No se pudieron cargar las recetas. ${error instanceof Error ? error.message : 'Error del servidor.'}`);
        this.isLoading.set(false);
      },
    });
  }

  onVerDetalleReceta(recetaId: string | number): void {
    this.router.navigate(['/recetas', recetaId]);
  }

  onToggleFavoritoReceta(event: { id: string | number; esFavorito: boolean }): void {
    const { id, esFavorito } = event;

    this.recetas.update(currentRecetas =>
      currentRecetas.map(r => (r.idReceta === id ? { ...r, esFavorito: esFavorito } : r))
    );

    // this.recetaService.toggleFavorito(id, esFavorito).subscribe({
    //   next: (recetaActualizada) => {
    //     // Confirmar el cambio con la respuesta del servidor (opcional si ya es optimista)
    //     // Si la respuesta del servidor es la fuente de verdad, actualiza de nuevo:
    //     this.recetas.update(currentRecetas =>
    //       currentRecetas.map(r => (r.id === recetaActualizada.id ? recetaActualizada : r))
    //     );
    //     console.log('Receta actualizada (favorito) en backend:', recetaActualizada);
    //   },
    //   error: (error: HttpErrorResponse | Error) => {
    //     console.error('Error al actualizar favorito:', error);
    //     // Revertir el cambio en la UI si la llamada falla
    //     this.recetas.update(currentRecetas =>
    //       currentRecetas.map(r => (r.id === id ? { ...r, esFavorito: !esFavorito } : r)) // Revertir al estado anterior
    //     );
    //     this.errorMensaje.set(`Error al actualizar favorito. ${error instanceof Error ? error.message : 'Inténtalo de nuevo.'}`);
    //   }
    // });
  }
}
