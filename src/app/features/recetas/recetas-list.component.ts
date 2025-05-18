import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recetas-list', // Asegúrate que el selector es único y correcto
  standalone: true,
  imports: [CommonModule],
  template: `<p>Lista de Recetas (Próximamente)</p>`,
})
export class RecetasListComponent {}
