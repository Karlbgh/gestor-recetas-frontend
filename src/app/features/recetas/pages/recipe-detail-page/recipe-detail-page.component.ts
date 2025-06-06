import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Receta } from '../../models/receta.model';
import { RecetaService } from '../../services/receta.service';

@Component({
  selector: 'app-recipe-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage],
  templateUrl: './recipe-detail-page.component.html',
  styleUrls: ['./recipe-detail-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recetaService = inject(RecetaService);

  receta = signal<Receta | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  readonly placeholderImageUrl = 'https://via.placeholder.com/1200x600/E0E0E0/757575?Text=Imagen+no+disponible';

  ngOnInit(): void {
    const recetaId = this.route.snapshot.paramMap.get('id');
    if (recetaId) {
      this.cargarReceta(recetaId);
    } else {
      this.handleError('No se proporcionó un ID de receta.');
    }
  }

  cargarReceta(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.recetaService.getRecetaById(id).subscribe({
      next: (data) => {
        this.receta.set(data);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.handleError('La receta que buscas no existe. Es posible que haya sido eliminada.');
        } else {
          this.handleError('No se pudo cargar la receta. Por favor, inténtalo de nuevo más tarde.');
        }
      },
    });
  }

  /**
   * Navega a la lista principal de recetas.
   * Este método es público para poder ser llamado desde la plantilla.
   */
  navigateToRecetas(): void {
    this.router.navigate(['/recetas']);
  }

  private handleError(message: string): void {
    this.errorMessage.set(message);
    this.isLoading.set(false);
    console.error(message);
  }

  getDificultadClass(dificultad: string): string {
    switch (dificultad.toLowerCase()) {
      case 'fácil':
        return 'bg-green-100 text-green-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'difícil':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
