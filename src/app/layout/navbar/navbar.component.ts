import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  imports: [
    CommonModule,
    // RouterLink
],
})
export class NavbarComponent {
  @Output() toggleSidenav = new EventEmitter<void>();

  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.signOut();
    this.router.navigate(['/login']);
  }

  navigateToProfile(): void {
    // Lógica para navegar al perfil del usuario
    // Por ejemplo: this.router.navigate(['/perfil']);
    console.log('Navegar al perfil del usuario');
  }
}
