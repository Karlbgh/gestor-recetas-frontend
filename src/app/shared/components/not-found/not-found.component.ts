import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-title>404 - Página No Encontrada</mat-card-title>
        <mat-card-content>
          <p>Lo sentimos, la página que buscas no existe.</p>
        </mat-card-content>
        <mat-card-actions>
          <a mat-raised-button color="primary" routerLink="/">Ir a Inicio</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: calc(100vh - 120px); // Ajustar según altura de navbar/footer
      padding: 20px;
    }
    mat-card {
      max-width: 400px;
      text-align: center;
    }
  `]
})
export class NotFoundComponent {}
