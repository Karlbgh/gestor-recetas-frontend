import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // RouterOutlet es necesario para mostrar las vistas enrutadas
  template: `
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'gestor-recetas-frontend';

  // Inyecta el ThemeService.
  // Esto es suficiente para que el constructor del servicio se ejecute
  // y aplique el tema inicial gracias al 'effect'.
  private themeService = inject(ThemeService);

  // Opcionalmente, si quieres exponer métodos del servicio a la plantilla del AppComponent:
  // constructor(public themeService: ThemeService) {}
}
