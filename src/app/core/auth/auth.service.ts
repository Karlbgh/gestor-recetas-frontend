import { Injectable, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Usamos un WritableSignal para poder cambiar su valor desde el servicio
  private _isAuthenticated: WritableSignal<boolean> = signal(this.checkInitialAuthStatus());
  public isAuthenticated = this._isAuthenticated.asReadonly(); // Exponemos como readonly signal

  // Ejemplo: Almacenar un usuario simulado o información del perfil
  private _currentUser: WritableSignal<any | null> = signal(null);
  public currentUser = this._currentUser.asReadonly();

  constructor(private router: Router) {
    // Puedes cargar el estado de autenticación desde localStorage o una cookie aquí
  }

  private checkInitialAuthStatus(): boolean {
    // Lógica para comprobar si el usuario ya está autenticado al cargar la app
    // Por ejemplo, revisando localStorage o una cookie.
    // Esto es solo un placeholder.
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('isLoggedIn') === 'true';
    }
    return false;
  }

  login(userData: any): void {
    // Lógica de login real aquí (ej. llamada a API)
    // ...

    // Simulando un login exitoso
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
    }
    this._isAuthenticated.set(true);
    this._currentUser.set({ nombre: 'Usuario Ejemplo', email: userData.email }); // Guardar info del usuario
    this.router.navigate(['/']); // Redirigir a la página principal o al dashboard
  }

  register(userData: any): void {
    // Lógica de registro real aquí (ej. llamada a API)
    // ...

    // Simulando un registro exitoso y login automático
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
    }
    this._isAuthenticated.set(true);
    this._currentUser.set({ nombre: 'Nuevo Usuario', email: userData.email });
    this.router.navigate(['/']);
  }

  logout(): void {
    // Lógica de logout real aquí (ej. invalidar token en backend)
    // ...
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser'); // Limpiar datos del usuario
    }
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // Podrías añadir un método para obtener el nombre del usuario para el perfil
  getUserName(): string | null {
    const user = this.currentUser();
    return user ? user.nombre : null;
  }

  getToken(): string | null {
    // Aquí podrías implementar la lógica para obtener un token de autenticación
    // Por ejemplo, desde localStorage o una cookie
    return localStorage.getItem('authToken');
  }
}
