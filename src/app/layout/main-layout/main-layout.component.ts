import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component'; // Importa NavbarComponent

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './main-layout.component.html',
  // styleUrls: ['./main-layout.component.scss'] // No hay archivo scss
})
export class MainLayoutComponent {

}
