import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        this.currentUser.next(session.user);
      } else {
        this.currentUser.next(null);
      }
    });
  }


  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('Error signing in:', error.message);
      throw error;
    }
    if (data.user) {
      this.currentUser.next(data.user);
    }
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      throw error;
    }
    this.currentUser.next(null);
  }

  // ... otros métodos como signUp, resetPassword, getCurrentUser, etc.

  // Método para obtener el cliente de Supabase si necesitas acceder a él desde otros servicios
  // de una forma controlada (ej. para operaciones de base de datos)
  getClient(): SupabaseClient {
    return this.supabase;
  }


  /**
   * Retrieves the authentication token from localStorage.
   * @returns The authentication token string if found, otherwise null.
   */
  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null; // Retorna null si localStorage no está disponible (e.g., en SSR sin polyfills adecuados)
  }

    /**
   * Checks if a token exists in localStorage.
   * @returns True if a token exists, false otherwise.
   * @private
   */
  private hasToken(): boolean {
    return !!this.getToken();
  }
}
