// src/app/layout/navbar/navbar.component.ts

import { Component, inject, signal, ChangeDetectionStrategy, HostListener, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ CommonModule, RouterModule, ReactiveFormsModule ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  isAuthenticated = this.authService.isAuthenticated;
  userName = this.authService.profileName;
  userAvatarUrl = this.authService.profileAvatarUrl;

  searchControl = new FormControl('');
  isMobileMenuOpen = signal(false);
  isProfileMenuOpen = signal(false);

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter(term => typeof term === 'string' && (term.length === 0 || term.length >= 3)),
        tap(term => this.handleSearch(term as string))
      )
      .subscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeProfileMenu();
    }
  }

  toggleMobileMenu(): void { this.isMobileMenuOpen.update(isOpen => !isOpen); }
  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isProfileMenuOpen.update(isOpen => !isOpen);
  }

  handleSearch(term: string): void {
    if (term) {
      this.router.navigate(['/recetas'], { queryParams: { search: term } });
    }
  }

  onSearchSubmit(): void {
      this.handleSearch(this.searchControl.value || '');
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
    this.router.navigate(['/usuario/perfil']);
    this.closeProfileMenu();
    this.closeMobileMenu();
  }

  navigateToMyRecipes(): void {
    this.router.navigate(['/mis-recetas']);
    this.closeProfileMenu();
    this.closeMobileMenu();
  }

  navigateToCreateRecipe(): void {
    this.router.navigate(['/recetas/nueva']);
    this.closeProfileMenu();
    this.closeMobileMenu();
  }

  logout(): void {
    this.authService.logout();
    this.closeProfileMenu();
    this.closeMobileMenu();
  }

  private closeMobileMenu(): void { this.isMobileMenuOpen.set(false); }
  private closeProfileMenu(): void { this.isProfileMenuOpen.set(false); }
}
