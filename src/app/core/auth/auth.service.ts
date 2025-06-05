import { Injectable, signal, WritableSignal, inject, NgZone, computed, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private router = inject(Router);
  private ngZone = inject(NgZone);

  private _isAuthenticated: WritableSignal<boolean> = signal(false);
  public isAuthenticated = this._isAuthenticated.asReadonly();

  private _currentUser: WritableSignal<User | null> = signal(null);
  public currentUser = this._currentUser.asReadonly();

  public avatarUrl: Signal<string | null> = computed(() => {
    return this._currentUser()?.user_metadata?.['avatar_url'] || null;
  });

  private _currentSession: WritableSignal<Session | null> = signal(null);
  public currentSession = this._currentSession.asReadonly();

  private _recoveryEventOccurred: WritableSignal<boolean> = signal(false);
  public recoveryEventOccurred = this._recoveryEventOccurred.asReadonly();


 constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this._updateAuthState(!!session, session);
    });

    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      this.ngZone.run(() => {
        this._updateAuthStateOnEvent(event, session);
      });
    });
  }

  private _updateAuthState(isAuthenticated: boolean, session: Session | null) {
    this._isAuthenticated.set(isAuthenticated);
    this._currentUser.set(session?.user ?? null);
    this._currentSession.set(session);
  }

  private _updateAuthStateOnEvent(event: AuthChangeEvent, session: Session | null) {
    console.log('Auth state change:', event, session);
    if (event === 'PASSWORD_RECOVERY') {
        this._recoveryEventOccurred.set(true);
    } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
      this._updateAuthState(true, session);
      if (event === 'USER_UPDATED') {
        this._recoveryEventOccurred.set(false);
      }
      if (event === 'SIGNED_IN' && this.router.url.includes('/auth')) {
        this.router.navigate(['/']);
      }
    } else if (event === 'SIGNED_OUT') {
      this._updateAuthState(false, null);
      this._recoveryEventOccurred.set(false);
      this.router.navigate(['/']);
    }
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión con Supabase:', error);
    }
  }

  getUserName(): string | null {
    const user = this.currentUser();
    return user?.user_metadata?.['name'] || user?.email || null;
  }

  getToken(): string | null {
    const session = this.currentSession();
    return session?.access_token || null;
  }

  async loginWithEmail(email: string, password: string): Promise<{ user: User | null, session: Session | null, error: any }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, session: data.session, error };
  }

  async registerWithEmail(email: string, password: string, username: string): Promise<{ user: User | null, session: Session | null, error: any }> {
    const { data, error } = await this.supabase.auth.signUp({
      email, password,
      options: { data: { name: username, avatar_url: '' } }
    });
    return { user: data.user, session: data.session, error };
  }

  async signInWithGoogle(): Promise<void> {
    await this.supabase.auth.signInWithOAuth({ provider: 'google' });
  }

  async sendPasswordResetEmail(email: string): Promise<{ error: any }> {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
  }

  async updateUserPassword(password: string): Promise<{ user: User | null, error: any }> {
    const { data, error } = await this.supabase.auth.updateUser({ password });
    if (!error) this._recoveryEventOccurred.set(false);
    return { user: data.user, error };
  }

  async updateUserMetadata(data: { name?: string, avatar_url?: string }): Promise<{ user: User | null, error: any }> {
    const { data: updatedUserData, error } = await this.supabase.auth.updateUser({ data });
    return { user: updatedUserData.user, error };
  }

  // --- NUEVOS MÉTODOS PARA EL AVATAR ---

  /**
   * Sube un archivo de imagen al bucket 'avatars' en Supabase Storage.
   * @param file El archivo a subir.
   * @returns El path del archivo subido o un error.
   */
  async uploadAvatar(file: File): Promise<{ path: string | null; error: any }> {
    const user = this.currentUser();
    if (!user) return { path: null, error: 'Usuario no autenticado' };

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error } = await this.supabase.storage.from('avatars').upload(filePath, file);

    if (error) {
      console.error('Error al subir avatar a Supabase Storage:', error);
      return { path: null, error };
    }
    return { path: filePath, error: null };
  }

  /**
   * Obtiene la URL pública de un archivo en el bucket 'avatars'.
   * @param path El path del archivo dentro del bucket.
   * @returns La URL pública completa.
   */
  getAvatarPublicUrl(path: string): string | null {
    if (!path) return null;
    const { data } = this.supabase.storage.from('avatars').getPublicUrl(path);
    return data?.publicUrl || null;
  }
}
