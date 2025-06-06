import { Component, OnInit, inject, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Receta } from '../../models/receta.model';
import { RecetaService } from '../../services/receta.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card.component';

@Component({
  selector: 'app-mis-recetas-page',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent],
  templateUrl: './mis-recetas-page.component.html',
  styleUrls: ['./mis-recetas-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisRecetasPageComponent implements OnInit {
  private recetaService = inject(RecetaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  recetas: WritableSignal<Receta[]> = signal([]);
  isLoading = signal(true);
  errorMensaje = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarMisRecetas();
  }

  cargarMisRecetas(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser?.id) {
      this.errorMensaje.set('No se ha podido identificar al usuario.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMensaje.set(null);

    this.recetaService.getRecetasByUsuario(currentUser.id).subscribe({
      next: (data) => {
        this.recetas.set(data);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse | Error) => {
        console.error('Error al cargar mis recetas:', error);
        this.errorMensaje.set('No se pudieron cargar tus recetas. Inténtalo de nuevo más tarde.');
        this.isLoading.set(false);
      },
    });
  }

  onVerDetalleReceta(recetaId: string | number): void {
    this.router.navigate(['/recetas', recetaId]);
  }

  onEditarReceta(recetaId: string | number): void {
    this.router.navigate(['/recetas', recetaId, 'editar']);
  }

  onEliminarReceta(recetaId: string | number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
      // Lógica de eliminación...
      console.log('Eliminando receta con ID:', recetaId);
    }
  }

  navigateToCreateRecipe(): void {
    this.router.navigate(['/recetas/nueva']);
  }
}
