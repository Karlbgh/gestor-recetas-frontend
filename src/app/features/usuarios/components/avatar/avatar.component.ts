import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent {
  @Input({ required: true }) avatarUrl: string | null = null;
  @Output() upload = new EventEmitter<File>();

  errorMessage = signal<string | null>(null);

  /**
   * Se dispara cuando el usuario selecciona un archivo.
   * Valida el tamaño y emite el archivo válido.
   * @param event El evento del input de tipo 'file'.
   */
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.errorMessage.set(null);
      // Validación: Límite de tamaño a 2MB
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage.set('El archivo es demasiado grande (máx 2MB).');
        // Limpiamos el valor del input para que pueda seleccionar el mismo archivo de nuevo si lo desea
        input.value = '';
        return;
      }
      this.upload.emit(file);
    }
  }
}
