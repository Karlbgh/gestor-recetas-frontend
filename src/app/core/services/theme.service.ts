import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themeKey = 'app-theme';
  private isBrowser: boolean;

  // Usamos un signal para el tema actual.
  // Inicializamos desde localStorage o con 'light' por defecto.
  public currentTheme = signal<Theme>(this.getInitialTheme());

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Efecto para reaccionar a los cambios en currentTheme
    effect(() => {
      const theme = this.currentTheme();
      if (this.isBrowser) {
        localStorage.setItem(this.themeKey, theme);
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
      }
    });
  }

  private getInitialTheme(): Theme {
    if (this.isBrowser) {
      const storedTheme = localStorage.getItem(this.themeKey) as Theme | null;
      if (storedTheme) {
        return storedTheme;
      }
      // Opcional: detectar preferencia del sistema
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light'; // Default theme
  }

  public toggleTheme(): void {
    this.currentTheme.update(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }

  public setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }
}
