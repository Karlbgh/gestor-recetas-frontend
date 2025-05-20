import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngFor, async pipe, etc.
import { RouterModule } from '@angular/router'; // Para routerLink
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip'; // Para tooltips
import { MatDividerModule } from '@angular/material/divider'; // Para divisores
import { MatListModule } from '@angular/material/list'; // Para listas, si aplica

import { RecetaService } from './services/receta.service';
import { Receta } from './models/receta.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-receta-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <mat-card *ngIf="receta" class="receta-card">
      <mat-card-header>
        <mat-card-title>{{ receta.nombre }}</mat-card-title>
        <mat-card-subtitle *ngIf="receta.dificultad">
          Dificultad: {{ receta.dificultad }}
          <span *ngIf="receta.tiempoPreparacion"> - {{ receta.tiempoPreparacion }} min</span>
        </mat-card-subtitle>
      </mat-card-header>
      <img mat-card-image [src]="receta.imagenUrl || 'assets/images/placeholder-recipe.png'" (error)="onImageError($event)" [alt]="receta.nombre">
      <mat-card-content>
        <p class="descripcion">
          {{ (receta.descripcion && receta.descripcion.length > 100) ? (receta.descripcion | slice:0:100) + '...' : receta.descripcion }}
        </p>
        <mat-divider></mat-divider>
        <div class="nutricion-info" *ngIf="receta.caloriasTotales">
          <span><mat-icon>local_fire_department</mat-icon> {{ receta.caloriasTotales | number:'1.0-0' }} kcal</span>
          </div>
      </mat-card-content>
      <mat-card-actions>
        <a mat-button color="primary" [routerLink]="['/recetas', receta.id]">
          <mat-icon>visibility</mat-icon> VER DETALLE
        </a>
        </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .receta-card {
      margin-bottom: 20px;
      max-width: 350px; // O el ancho que prefieras
    }
    mat-card-image {
      height: 200px;
      object-fit: cover; // Para que la imagen cubra el área sin distorsionarse
    }
    .descripcion {
      min-height: 60px; // Para dar un alto uniforme si hay descripciones cortas
      margin-top: 10px;
    }
    .nutricion-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9em;
      color: #666;
      margin-top: 10px;
      mat-icon {
        font-size: 1.2em;
      }
    }
    .dark-theme .nutricion-info {
      color: #ccc;
    }
  `]
})
export class RecetaCardComponent {
  @Input({ required: true }) receta!: Receta;

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder-recipe.png';
  }
}


@Component({
  selector: 'app-recetas-list', // Este es el selector correcto para el componente principal de la lista
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    RecetaCardComponent // Importa el componente de tarjeta
  ],
  templateUrl: './recetas-list.component.html',
  styleUrls: ['./recetas-list.component.scss']
})
export class RecetasListComponent implements OnInit {
  private recetaService = inject(RecetaService);

  // Usando signals para el estado
  recetas = signal<Receta[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadRecetas();
  }

  loadRecetas(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.recetaService.getRecetas().subscribe({
      next: (data) => {
        this.recetas.set(data);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.message || 'Error al cargar las recetas.');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  // Aquí podrías añadir métodos para crear, editar, eliminar, etc.
  // que naveguen a otros componentes o abran modales.
}
