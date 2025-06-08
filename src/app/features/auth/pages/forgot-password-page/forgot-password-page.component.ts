import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { FooterComponent } from "../../../../layout/footer/footer.component";

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FooterComponent],
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.scss']
})
export class ForgotPasswordPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isLoading: WritableSignal<boolean> = signal(false);
  errorMessage: WritableSignal<string | null> = signal(null);
  successMessage: WritableSignal<string | null> = signal(null);

  async onSubmit(): Promise<void> {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const email = this.forgotPasswordForm.value.email;

    if (!email) {
      this.errorMessage.set('El correo electrónico es requerido.');
      this.isLoading.set(false);
      return;
    }

    try {
      const { error } = await this.authService.sendPasswordResetEmail(email);

      if (error) {
        this.errorMessage.set(error.message || 'Error al enviar el correo. Inténtalo de nuevo.');
      } else {
        this.successMessage.set('Si existe una cuenta con este correo, recibirás un enlace para restablecer tu contraseña.');
        this.forgotPasswordForm.reset();
      }
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Ocurrió un error inesperado.');
    } finally {
      this.isLoading.set(false);
    }
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }
}
