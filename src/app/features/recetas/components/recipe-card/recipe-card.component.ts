import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Receta } from '../../models/receta.model';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage],
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeCardComponent {
  @Input({ required: true }) receta!: Receta;
  @Output() verDetalle = new EventEmitter<string | number>();
  @Output() toggleFavorito = new EventEmitter<{ id: string | number; esFavorito: boolean }>();

  readonly placeholderImageUrl = 'https://via.placeholder.com/400x250/E0E0E0/757575?Text=Imagen+no+disponible';

  get imagenAMostrar(): string {
    return this.receta.imagen && this.receta.imagen.trim() !== ''
      ? this.receta.imagen
      : this.placeholderImageUrl;
  }

  onVerDetalle(): void {
    this.verDetalle.emit(this.receta.idReceta);
  }

  // onToggleFavorito(event: MouseEvent): void {
  //   event.stopPropagation(); // Prevenir que el click se propague, ej. si la tarjeta entera es clickeable
  //   const nuevoEstadoFavorito = !this.receta.esFavorito;
  //   this.toggleFavorito.emit({ id: this.receta.id, esFavorito: nuevoEstadoFavorito });
  // }

  // Para mostrar la puntuación con estrellas (simplificado)
  getPuntuacionEstrellas(puntuacion?: number): string {
    if (puntuacion === undefined || puntuacion === null || puntuacion < 0 || puntuacion > 5) {
      return 'Sin valorar';
    }
    const maxEstrellas = 5;
    const estrellasLlenas = Math.round(puntuacion);
    const estrellasVacias = maxEstrellas - estrellasLlenas;
    return '★'.repeat(estrellasLlenas) + '☆'.repeat(estrellasVacias);
  }
}
