import { Component, OnInit, inject, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Receta } from '../../models/receta.model';
import { RecetaService } from '../../services/receta.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { RecipeCardComponent } from '../../components/recipe-card/recipe-card.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-mis-recetas-page',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent, ConfirmationDialogComponent],
  templateUrl: './mis-recetas-page.component.html',
  styleUrls: ['./mis-recetas-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisRecetasPageComponent implements OnInit {
  private recetaService = inject(RecetaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  recetas: WritableSignal<Receta[]> = signal([]);
  isLoading = signal(true);
  errorMensaje = signal<string | null>(null);

  showDeleteConfirmation = signal(false);
  recetaAEliminar = signal<Receta | null>(null);

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
        // console.error('Error al cargar mis recetas:', error);
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

  /**
   * @param recetaId El ID de la receta a eliminar.
   */
  onEliminarReceta(recetaId: string | number): void {
    // console.log('this.recetas():', this.recetas());
    const receta = this.recetas().find(r => r.idReceta === recetaId) || null;
    this.recetaAEliminar.set(receta);
    // console.log('Preparando para eliminar receta: ',receta);
    this.showDeleteConfirmation.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirmation.set(false);
    this.recetaAEliminar.set(null);
  }

  async confirmDelete(): Promise<void> {
    const receta = this.recetaAEliminar();
    if (!receta) {
      return;
    }

    this.isLoading.set(true);

    if (receta.imagen) {
      const imagePath = this.authService.getPathFromUrl(receta.imagen, 'imagen-receta');
      if (imagePath) {
        try {
          const { error } = await this.authService.deleteRecetaImage(imagePath);
          if (error) {
            // console.warn('No se pudo eliminar la imagen de la receta. Se procederá a eliminar la receta de la base de datos.', error);
            this.notificationService.show('Advertencia: No se pudo eliminar el archivo de imagen.', 'error');
          } else {
            // console.log('Imagen de receta eliminada con éxito del storage.');
          }
        } catch (e) {
          // console.error('Excepción al intentar eliminar la imagen de la receta:', e);
        }
      }
    }

    // console.log(`Eliminando receta de la base de datos: ${receta.idReceta}`);
    this.recetaService.deleteReceta(receta.idReceta.toString()).subscribe({
      next: () => {
        this.recetas.update(recetas => recetas.filter(r => r.idReceta !== receta.idReceta));
        this.notificationService.show('Receta eliminada con éxito', 'success');
      },
      error: (error: HttpErrorResponse | Error) => {
        // console.error('Error al eliminar la receta:', error);s
        const errorMessage = error instanceof Error ? error.message : 'Error del servidor.';
        this.notificationService.show(`Error al eliminar: ${errorMessage}`, 'error');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
        this.cancelDelete();
      }
    });
  }


  navigateToCreateRecipe(): void {
    this.router.navigate(['/recetas/nueva']);
  }
}
