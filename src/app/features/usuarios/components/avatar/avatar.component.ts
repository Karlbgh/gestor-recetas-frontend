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

  isUploading = signal(false);
  uploadProgress = signal(0);
  errorMessage = signal<string | null>(null);

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.errorMessage.set(null);
      if (file.size > 2 * 1024 * 1024) { // Límite de 2MB
        this.errorMessage.set('El archivo es demasiado grande (máx 2MB).');
        return;
      }
      this.upload.emit(file);
    }
  }
}
