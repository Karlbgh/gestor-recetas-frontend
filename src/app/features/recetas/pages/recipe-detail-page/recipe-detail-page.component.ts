import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Receta } from '../../models/receta.model';
import { RecetaService } from '../../services/receta.service';
import { switchMap, tap } from 'rxjs/operators';

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

    this.recetaService.getRecetaById(id).pipe(
      switchMap(recetaData => {
        return this.recetaService.getIngredientesPorReceta(id).pipe(
          tap(ingredientes => {
            recetaData.ingredientes = ingredientes;
            const recetaCalculada = this.calcularValoresNutricionales(recetaData);
            this.receta.set(recetaCalculada);
            // console.log('Receta completa con ingredientes y valores calculados:', recetaCalculada);
          })
        );
      })
    ).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.handleError('La receta que buscas no existe. Es posible que haya sido eliminada.');
        } else {
          this.handleError('No se pudo cargar la receta o sus ingredientes. Por favor, inténtalo de nuevo más tarde.');
        }
        this.isLoading.set(false);
      },
    });
  }

  /**
   * @param receta La receta con su lista de ingredientes.
   * @returns La receta actualizada con los totales calculados.
   */
  private calcularValoresNutricionales(receta: Receta): Receta {
    let caloriasTotales = 0;
    let grasasTotales = 0;
    let proteinasTotales = 0;
    let carbohidratosTotales = 0;
    let azucaresTotales = 0;
    let sodioTotal = 0;

    if (receta.ingredientes) {
      for (const ingrediente of receta.ingredientes) {
        caloriasTotales += (ingrediente.calorias / 100) * ingrediente.cantidad;
        grasasTotales += (ingrediente.grasas / 100) * ingrediente.cantidad;
        proteinasTotales += (ingrediente.proteinas / 100) * ingrediente.cantidad;
        carbohidratosTotales += (ingrediente.carbohidratos/ 100) * ingrediente.cantidad;
        azucaresTotales += (ingrediente.azucares / 100) * ingrediente.cantidad;
        sodioTotal += (ingrediente.sodio / 100) * ingrediente.cantidad;
      }
    }

    return {
      ...receta,
      caloriasTotales: Math.round(caloriasTotales),
      grasasTotales: Math.round(grasasTotales),
      proteinasTotales: Math.round(proteinasTotales),
      carbohidratosTotales: Math.round(carbohidratosTotales),
      azuacaresTotales: Math.round(azucaresTotales),
      sodioTotal: Math.round(sodioTotal),
    };
  }

  getWhatsAppShareUrl(): string {
    const recetaActual = this.receta();
    if (!recetaActual) {
      return '';
    }

    const text = `¡Mira esta deliciosa receta de "${recetaActual.nombre}" que encontré en GestorRecetas! ${window.location.href}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }

  navigateToRecetas(): void {
    this.router.navigate(['/recetas']);
  }

  private handleError(message: string): void {
    this.errorMessage.set(message);
    this.isLoading.set(false);
    // console.error(message);
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
