import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy, HostListener, ElementRef, computed } from '@angular/core';
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
  private elementRef = inject(ElementRef);
  // private recetaService = inject(RecetaService); // Descomentar si tienes el servicio de recetas

  isAuthenticated = this.authService.isAuthenticated; // Signal del servicio de autenticación

  // CORREGIDO: Usamos `computed` para derivar el nombre del usuario de forma reactiva.
  // Esta señal se actualizará automáticamente cuando `currentUser` en el servicio cambie.
  userName = computed(() => {
    const user = this.authService.getUserName();
    return user;
  });

  searchTerm: WritableSignal<string> = signal('');
  searchControl = new FormControl('');

  isMobileMenuOpen: WritableSignal<boolean> = signal(false);
  isProfileMenuOpen: WritableSignal<boolean> = signal(false);

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Si el clic fue fuera del componente navbar, cierra el menú de perfil
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeProfileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(isOpen => !isOpen);
  }

  toggleProfileMenu(event: MouseEvent): void {
    // Detenemos la propagación para que el clic no llegue al HostListener del documento
    event.stopPropagation();
    this.isProfileMenuOpen.update(isOpen => !isOpen);
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
    this.closeProfileMenu();
    this.closeMobileMenu();
  }

  navigateToMyRecipes(): void {
    // TODO: Asegúrate de que la ruta '/mis-recetas' exista en tu configuración de rutas.
    this.router.navigate(['/mis-recetas']);
    this.closeProfileMenu();
    this.closeMobileMenu();
  }

  navigateToCreateRecipe(): void {
    // Asegúrate de que la ruta '/recetas/nueva' exista en tu configuración de rutas.
    this.router.navigate(['/recetas/nueva']);
    this.closeProfileMenu();
    this.closeMobileMenu();
  }

  logout(): void {
    this.authService.logout();
    this.closeProfileMenu();
    this.closeMobileMenu();
  }

  private closeMobileMenu(): void {
    if (this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
    }
  }

  private closeProfileMenu(): void {
    if (this.isProfileMenuOpen()) {
      this.isProfileMenuOpen.set(false);
    }
  }
}
