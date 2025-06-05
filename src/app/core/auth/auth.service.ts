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

  // Signal para notificar cuando ocurre el evento de recuperación
  private _recoveryEventOccurred: WritableSignal<boolean> = signal(false);
  public recoveryEventOccurred = this._recoveryEventOccurred.asReadonly();


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
        if (event === 'PASSWORD_RECOVERY') {
            console.log('Evento de recuperación de contraseña detectado.');
            this._recoveryEventOccurred.set(true);
            // No establecemos la sesión como autenticada todavía.
            // El usuario necesita establecer una nueva contraseña.
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          this._isAuthenticated.set(true);
          this._currentUser.set(session!.user); // session no será null en SIGNED_IN
          this._currentSession.set(session);
          // Si el usuario actualiza su contraseña, la sesión se actualiza y podría
          // entrar aquí. Limpiamos el flag de recuperación.
          this._recoveryEventOccurred.set(false);
          // Opcional: Redirigir si es un SIGNED_IN y el usuario no está ya en una ruta protegida.
          if (event === 'SIGNED_IN' && this.router.url.includes('/auth')) {
            this.router.navigate(['/']);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('Usuario ha cerrado sesión.');
          this._isAuthenticated.set(false);
          this._currentUser.set(null);
          this._currentSession.set(null);
          this._recoveryEventOccurred.set(false); // Limpiar al cerrar sesión
          this.router.navigate(['/']);
        }
      });
    });
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

  getUserName(): string | null {
    const user = this.currentUser();
    // CORREGIDO: Buscar el nombre en user_metadata, que se guarda en el registro.
    // Usar el email como fallback si no existe.
    return user?.user_metadata?.['username'] || user?.email || null;
  }

  getToken(): string | null {
    const session = this.currentSession();
    return session?.access_token || null;
  }

async loginWithEmail(email: string, password: string): Promise<{ user: User | null, session: Session | null, error: any }> {
    console.log(`AuthService: Intentando iniciar sesión con Supabase. Email: ${email} - Password: ${password}`);
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

    console.log('Registro enviado a Supabase:', data);
    return { user: data.user, session: data.session, error: null };
  }

  async signInWithGoogle(): Promise<void> {
    console.log('AuthService: Intentando iniciar sesión con Google.');
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Error al iniciar sesión con Google (Supabase):', error);
    }
  }

  /**
   * Envía un correo para restablecer la contraseña a través de Supabase.
   * @param email El correo del usuario.
   */
  async sendPasswordResetEmail(email: string): Promise<{ error: any }> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`, // URL a la que se redirigirá al usuario
    });
    return { error };
  }

  /**
   * Actualiza la contraseña del usuario actualmente en sesión de recuperación.
   * @param password La nueva contraseña.
   */
  async updateUserPassword(password: string): Promise<{ user: User | null, error: any }> {
    const { data, error } = await this.supabase.auth.updateUser({ password: password });
    if (!error && data.user) {
        // La sesión se actualiza automáticamente por onAuthStateChange.
        // Limpiamos el flag de recuperación manualmente aquí también.
        this._recoveryEventOccurred.set(false);
    }
    return { user: data.user, error };
  }
}
