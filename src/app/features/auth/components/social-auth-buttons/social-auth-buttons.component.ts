import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-social-auth-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-auth-buttons.component.html',
  styleUrls: ['./social-auth-buttons.component.scss']
})
export class SocialAuthButtonsComponent {
  private authService = inject(AuthService);
  isLoadingGoogle: WritableSignal<boolean> = signal(false);
  errorMessageGoogle: WritableSignal<string | null> = signal(null);

  async loginWithGoogle(): Promise<void> {
    //console.log('SocialAuthButtonsComponent: Login with Google clicked');
    //console.log('AuthService instance in SocialAuthButtonsComponent (moved up):', this.authService);
    this.isLoadingGoogle.set(true);
    this.errorMessageGoogle.set(null);

    try {
      //console.log('AuthService instance in SocialAuthButtonsComponent:', this.authService);

      if (!this.authService) {
        // console.error('AuthService no está inyectado o no está disponible.');
        this.errorMessageGoogle.set('Error interno: Servicio de autenticación no disponible.');
        this.isLoadingGoogle.set(false);
        return;
      }

      await this.authService.signInWithGoogle();

    } catch (error: any) {
      // console.error('Error al intentar iniciar sesión con Google desde el componente:', error);
      this.errorMessageGoogle.set(error.message || 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
      this.isLoadingGoogle.set(false);
    }
  }
}
