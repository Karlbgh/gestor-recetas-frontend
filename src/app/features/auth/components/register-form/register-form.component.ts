import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';


export function passwordMatchValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    if (matchingControl.errors && !matchingControl.errors['passwordMismatch']) {
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
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator('password', 'confirmPassword') });

  isLoading: WritableSignal<boolean> = signal(false);
  errorMessage: WritableSignal<string | null> = signal(null);
  successMessage: WritableSignal<string | null> = signal(null);

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { username, email, password } = this.registerForm.value;

    if (!username || !email || !password) {
      this.errorMessage.set('Faltan campos por rellenar.');
      this.isLoading.set(false);
      return;
    }

    try {
      const { error } = await this.authService.registerWithEmail(email, password, username);

      if (error) {
        if (error.message.includes('User already registered')) {
          this.errorMessage.set('Este correo electrónico ya está registrado.');
        } else {
          this.errorMessage.set(`Error en el registro: ${error.message}`);
        }
      } else {
        this.successMessage.set('¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.');
        this.registerForm.reset();
      }
    } catch (e: any) {
      // console.error('Excepción durante el registro:', e);
      this.errorMessage.set(e.message || 'Ocurrió un error inesperado durante el registro.');
    } finally {
      this.isLoading.set(false);
    }
  }

  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
}
