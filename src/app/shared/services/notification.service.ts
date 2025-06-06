import { Injectable, signal } from '@angular/core';

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notification = signal<Notification | null>(null);

  /**
   * Muestra una notificación y la oculta después de un tiempo.
   * @param message El mensaje a mostrar.
   * @param type El tipo de notificación ('success' o 'error').
   */
  show(message: string, type: 'success' | 'error' = 'success') {
    this.notification.set({ message, type });
    setTimeout(() => {
      this.notification.set(null);
    }, 4000); // La notificación desaparecerá después de 4 segundos
  }
}
