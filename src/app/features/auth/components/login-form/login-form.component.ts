import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  isLoading: WritableSignal<boolean> = signal(false);
  errorMessage: WritableSignal<string | null> = signal(null);

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage.set('Por favor, corrige los errores del formulario.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    try {
      // Aseguramos que email y password no sean nulos/undefined antes de la llamada
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos.');
      }

      const { user, session, error } = await this.authService.loginWithEmail(email, password);

      if (error) {
        // Traducir errores comunes de Supabase a mensajes amigables
        if (error.message === 'Invalid login credentials') {
          this.errorMessage.set('Correo electrónico o contraseña incorrectos.');
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          this.errorMessage.set('Por favor, confirma tu correo electrónico antes de iniciar sesión.');
        }
        else {
          this.errorMessage.set(`Error: ${error.message || 'No se pudo iniciar sesión. Inténtalo de nuevo.'}`);
        }
        console.error('Error en el componente de login:', error);
      } else if (user && session) {
        //console.log('Login exitoso desde el componente:', user);
        // AuthService.onAuthStateChange se encargará de la redirección principal
        // pero si necesitas una acción específica aquí, puedes hacerla.
        // Ejemplo: this.router.navigate(['/dashboard']);
        // Si onAuthStateChange ya redirige a '/', no es necesario hacerlo aquí.
      } else {
        // Caso inesperado donde no hay error pero tampoco usuario/sesión
        this.errorMessage.set('Respuesta inesperada del servidor de autenticación.');
      }
    } catch (e: any) {
      console.error('Excepción durante el login:', e);
      this.errorMessage.set(e.message || 'Ocurrió un error inesperado.');
    } finally {
      this.isLoading.set(false);
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
