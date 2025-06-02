import { Injectable, signal, WritableSignal, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Observable, from } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private router = inject(Router);
  private ngZone = inject(NgZone);

  // Usamos un WritableSignal para poder cambiar su valor desde el servicio
  private _isAuthenticated: WritableSignal<boolean> = signal(false);
  public isAuthenticated = this._isAuthenticated.asReadonly();

  private _currentUser: WritableSignal<User | null> = signal(null);
  public currentUser = this._currentUser.asReadonly();

  private _currentSession: WritableSignal<Session | null> = signal(null);
  public currentSession = this._currentSession.asReadonly();

 constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // Cargar estado inicial de autenticación (importante para refrescos de página)
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        this._isAuthenticated.set(true);
        this._currentUser.set(session.user);
        this._currentSession.set(session);
      } else {
        this._isAuthenticated.set(false);
        this._currentUser.set(null);
        this._currentSession.set(null);
      }
    });

    // Escuchar cambios en el estado de autenticación
    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      this.ngZone.run(() => {
        console.log('Auth state change:', event, session);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          this._isAuthenticated.set(true);
          this._currentUser.set(session!.user); // session no será null en SIGNED_IN
          this._currentSession.set(session);
          // Opcional: Redirigir si es un SIGNED_IN y el usuario no está ya en una ruta protegida.
          if (event === 'SIGNED_IN' && this.router.url.includes('/auth')) {
            this.router.navigate(['/']);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('Usuario ha cerrado sesión.');
          this._isAuthenticated.set(false);
          this._currentUser.set(null);
          this._currentSession.set(null);
          this.router.navigate(['/']);
        }
      });
    });
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
    // this._currentUser.set({ nombre: 'Usuario Ejemplo', email: userData.email }); // Guardar info del usuario
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
    // this._currentUser.set({ nombre: 'Nuevo Usuario', email: userData.email });
    this.router.navigate(['/']);
  }

  async logout(): Promise<void> {
    console.log('AuthService: Intentando cerrar sesión con Supabase.');
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      console.error('Error al cerrar sesión con Supabase:', error);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
      }
      this._isAuthenticated.set(false);
      this._currentUser.set(null);
      this._currentSession.set(null);
      this.router.navigate(['/']);

    } else {
      console.log('Cierre de sesión con Supabase exitoso. onAuthStateChange se encargará del resto.');
    }
  }

  // Podrías añadir un método para obtener el nombre del usuario para el perfil
  getUserName(): string | null {
    const user = this.currentUser();
    return user ? user.id : null;
  }

  getToken(): string | null {
    // Aquí podrías implementar la lógica para obtener un token de autenticación
    // Por ejemplo, desde localStorage o una cookie
    return localStorage.getItem('authToken');
  }

async loginWithEmail(email: string, password: string): Promise<{ user: User | null, session: Session | null, error: any }> {
    console.log(`AuthService: Intentando iniciar sesión con Supabase. Email: ${email}`);
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Error en login con Supabase:', error);
      this._isAuthenticated.set(false);
      this._currentUser.set(null);
      this._currentSession.set(null);
      return { user: null, session: null, error };
    }

    if (data.session && data.user) {
      console.log('Login exitoso con Supabase:', data);
      this._isAuthenticated.set(true);
      this._currentUser.set(data.user);
      this._currentSession.set(data.session);
      this.router.navigate(['/']);
      return { user: data.user, session: data.session, error: null };
    }
    // Caso inesperado
    return { user: null, session: null, error: new Error('Respuesta inesperada de Supabase en login.') };
  }

  async registerWithEmail(email: string, password: string, username?: string): Promise<{ user: User | null, session: Session | null, error: any }> {
    const { data, error } = await this.supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
        }
      }
    });

    if (error) {
      console.error('Error en registro con Supabase:', error);
      return { user: null, session: null, error };
    }
    // Si el registro es exitoso pero requiere confirmación de email, data.user no estará autenticado aún.
    // onAuthStateChange manejará el estado si el usuario se autentica después de confirmar.
    // Si la confirmación de email no está habilitada, data.user y data.session estarán presentes.
    console.log('Registro enviado a Supabase:', data);
    return { user: data.user, session: data.session, error: null };
  }
}
