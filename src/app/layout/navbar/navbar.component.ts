import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';

import { AuthService } from '../../core/auth/auth.service';
// Asumiendo que tendrás un servicio para la búsqueda de recetas
// import { RecetaService } from '../../features/recetas/services/receta.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // Buena práctica para optimizar
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  // private recetaService = inject(RecetaService); // Descomentar si tienes el servicio de recetas

  isAuthenticated = this.authService.isAuthenticated; // Signal del servicio de autenticación
  userName = this.authService.getUserName; // Signal o método para obtener el nombre del usuario

  searchTerm: WritableSignal<string> = signal('');
  searchControl = new FormControl('');

  isMobileMenuOpen: WritableSignal<boolean> = signal(false);

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Espera 300ms después de la última pulsación
        distinctUntilChanged(), // Solo emite si el valor cambia
        filter(term => typeof term === 'string' && (term.length === 0 || term.length >= 3)), // Busca si está vacío (para limpiar) o tiene al menos 3 caracteres
        tap(term => this.handleSearch(term as string))
      )
      .subscribe();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(isOpen => !isOpen);
  }

  handleSearch(term: string | null): void {
    const currentTerm = term || '';
    this.searchTerm.set(currentTerm);
    console.log('Buscando recetas con término:', currentTerm);
    // Aquí llamarías a tu servicio de búsqueda de recetas
    // this.recetaService.searchRecipes(currentTerm);
    // O podrías navegar a una página de resultados de búsqueda
    if (currentTerm) {
      this.router.navigate(['/recetas/buscar'], { queryParams: { q: currentTerm } });
    } else {
      // Opcional: navegar a la lista principal de recetas si la búsqueda se borra
      // this.router.navigate(['/recetas']);
    }
  }

  onSearchSubmit(): void {
    // En caso de que quieras manejar el submit del formulario (ej. presionar Enter)
    // aunque el valueChanges ya lo maneja de forma reactiva.
    const term = this.searchControl.value;
    if (term) {
      this.handleSearch(term);
    }
  }

  navigateToLogin(): void {
     this.router.navigate(['/auth'], { queryParams: { mode: 'login' } });
    this.closeMobileMenu();
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth'], { queryParams: { mode: 'register' } });
    this.closeMobileMenu();
  }

  navigateToProfile(): void {
    this.router.navigate(['/perfil']); // Asegúrate de que esta ruta existe
    this.closeMobileMenu();
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }

  private closeMobileMenu(): void {
    if (this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
    }
  }
}
