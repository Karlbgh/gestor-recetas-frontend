import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service'; // Asegúrate que la ruta sea correcta

// Validador personalizado para confirmar que las contraseñas coinciden
export function passwordMatchValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    if (matchingControl.errors && !matchingControl.errors['passwordMismatch']) {
      // return if another validator has already found an error on the matchingControl
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
  private authService = inject(AuthService); // Inyecta tu AuthService

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator('password', 'confirmPassword') });

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { username, email, password } = this.registerForm.value;
      console.log('Register submitted:', { username, email, password });
      // Aquí llamarías a tu servicio de autenticación
      // this.authService.registerWithEmail(username!, email!, password!).subscribe(...);
    } else {
      this.registerForm.markAllAsTouched();
      console.error('Formulario no válido');
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
