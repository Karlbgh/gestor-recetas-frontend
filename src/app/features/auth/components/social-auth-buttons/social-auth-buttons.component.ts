import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-social-auth-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-auth-buttons.component.html',
  styleUrls: ['./social-auth-buttons.component.scss']
})
export class SocialAuthButtonsComponent {
  private authService = inject(AuthService); // Inyecta tu AuthService

  loginWithGoogle(): void {
    console.log('Login with Google clicked');
    // Aquí llamarías a tu servicio de autenticación para Google
    // this.authService.loginWithGoogle().subscribe(...);
  }
}
