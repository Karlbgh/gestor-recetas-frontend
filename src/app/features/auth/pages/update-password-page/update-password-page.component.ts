import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { FooterComponent } from "../../../../layout/footer/footer.component";

// Validador para confirmar que las contraseñas coinciden
export function passwordMatchValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl || !matchingControl.errors || matchingControl.errors['passwordMismatch']) {
      return null;
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      matchingControl.setErrors(null);
      return null;
    }
  };
}


@Component({
  selector: 'app-update-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FooterComponent],
  templateUrl: './update-password-page.component.html',
  styleUrls: ['./update-password-page.component.scss']
})
export class UpdatePasswordPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Formulario para la nueva contraseña
  updatePasswordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator('password', 'confirmPassword') });

  // Signals para el estado de la UI
  isLoading: WritableSignal<boolean> = signal(false);
  errorMessage: WritableSignal<string | null> = signal(null);
  successMessage: WritableSignal<string | null> = signal(null);

  recoveryEventOccurred = this.authService.recoveryEventOccurred;

  ngOnInit(): void {
    // Escuchamos el evento de recuperación. Si el usuario llega aquí sin
    // el token correcto, el servicio no emitirá el evento.
    if (!this.recoveryEventOccurred()) {
       this.errorMessage.set("Token de recuperación inválido o expirado. Por favor, solicita un nuevo enlace.");
    }
  }

  /**
   * Se ejecuta al enviar el formulario para actualizar la contraseña.
   */
  async onSubmit(): Promise<void> {
    if (this.updatePasswordForm.invalid) {
      this.updatePasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const password = this.updatePasswordForm.value.password;

    if (!password) {
      this.errorMessage.set('La contraseña no puede estar vacía.');
      this.isLoading.set(false);
      return;
    }

    try {
      const { error } = await this.authService.updateUserPassword(password);
      if (error) {
        this.errorMessage.set(error.message || 'No se pudo actualizar la contraseña.');
      } else {
        this.successMessage.set('¡Tu contraseña ha sido actualizada con éxito! Serás redirigido para iniciar sesión.');
        setTimeout(() => this.router.navigate(['/auth']), 4000);
      }
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Ocurrió un error inesperado.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Getters para fácil acceso en la plantilla
  get password() { return this.updatePasswordForm.get('password'); }
  get confirmPassword() { return this.updatePasswordForm.get('confirmPassword'); }
}
