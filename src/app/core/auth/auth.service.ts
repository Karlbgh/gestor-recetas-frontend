import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment'; // Necesitarás supabaseUrl y supabaseKey
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private isBrowser: boolean;

  // Signals para el estado de autenticación
  public currentUser = signal<User | null>(null);
  public currentSession = signal<Session | null>(null);
  public isAuthenticated = signal<boolean>(false);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (!environment.supabaseUrl || !environment.supabaseKey) {
      throw new Error('Supabase URL and Key must be provided in environment files.');
    }
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    if (this.isBrowser) {
      this.supabase.auth.getSession().then(({ data: { session } }) => {
        this.currentSession.set(session);
        this.currentUser.set(session?.user ?? null);
        this.isAuthenticated.set(!!session);
      });

      this.supabase.auth.onAuthStateChange((event, session) => {
        this.currentSession.set(session);
        this.currentUser.set(session?.user ?? null);
        this.isAuthenticated.set(!!session);

        if (event === 'SIGNED_IN') {
          // Opcional: Redirigir después del login
          // this.router.navigate(['/']);
        }
        if (event === 'SIGNED_OUT') {
          this.router.navigate(['/login']); // O a la página que desees
        }
      });
    }
  }

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signUpWithEmail(email: string, password: string, additionalData?: object) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: additionalData // ej. { nombre: 'Usuario' }
      }
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  // ... otros métodos como signInWithOAuth, resetPassword, etc.
}
