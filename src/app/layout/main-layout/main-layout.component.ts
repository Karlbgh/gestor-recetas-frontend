import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
// import { FooterComponent } from '../footer/footer.component'; // Si tuvieras un footer

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent /*, FooterComponent */],
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    `,
  styles: [`
    .main-content {
      padding: 20px; // Un poco de padding alrededor del contenido principal
      // Puedes añadir más estilos para el layout aquí
    }
  `]
})
export class MainLayoutComponent {}
