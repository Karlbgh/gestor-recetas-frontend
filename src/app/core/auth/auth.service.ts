import { Injectable, signal, WritableSignal, inject, NgZone, computed, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { PerfilUsuarioService } from '../../features/usuarios/services/perfil-usuario.service';
import { PerfilUsuario } from '../../features/usuarios/models/perfil-usuario.model';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private perfilUsuarioService = inject(PerfilUsuarioService);

  private _isAuthenticated: WritableSignal<boolean> = signal(false);
  public isAuthenticated = this._isAuthenticated.asReadonly();

  private _currentUser: WritableSignal<User | null> = signal(null);
  public currentUser = this._currentUser.asReadonly();

  private _currentSession: WritableSignal<Session | null> = signal(null);
  public currentSession = this._currentSession.asReadonly();

  private _profileName = signal<string | null>(null);
  public profileName = this._profileName.asReadonly();

  private _profileAvatarUrl = signal<string | null>(null);
  public profileAvatarUrl = this._profileAvatarUrl.asReadonly();

  private _recoveryEventOccurred: WritableSignal<boolean> = signal(false);
  public recoveryEventOccurred = this._recoveryEventOccurred.asReadonly();


constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    this.supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        this.validateAndUpdateAuthState(session);
      } else {
        this._updateAuthState(false, null);
      }
    });

    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      this.ngZone.run(() => {
        this._updateAuthStateOnEvent(event, session);
      });
    });
  }

  private async validateAndUpdateAuthState(session: Session | null): Promise<void> {
    if (!session?.user?.id) {
      this._updateAuthState(false, null);
      return;
    }

    try {
      const perfil = await firstValueFrom(this.perfilUsuarioService.getPerfil(session.user.id));
      if (perfil.isDeleted) {
        // console.warn('Intento de login de usuario con cuenta desactivada. Cerrando sesión.');
        await this.supabase.auth.signOut();
        this._updateAuthState(false, null);
      } else {
        this._updateAuthState(true, session);
        this.loadUserProfile();
      }
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        //  console.warn('Intento de login de usuario sin perfil válido (404). Cerrando sesión.');
         await this.supabase.auth.signOut();
         this._updateAuthState(false, null);
      } else {
        // console.error('Error al validar el perfil del usuario durante el inicio de sesión.', error);
        await this.supabase.auth.signOut();
        this._updateAuthState(false, null);
      }
    }
  }


  loadUserProfile(): void {

    if (!this.isAuthenticated()) {
      // console.warn('[DEBUG] AuthService: loadUserProfile detenido, usuario no autenticado.');
      return;
    }
    const userId = this.currentUser()?.id;

    if (!userId) {
      // console.warn('[DEBUG] AuthService: loadUserProfile detenido, no se encontró ID de usuario.');
      return;
    }

    this.perfilUsuarioService.getPerfil(userId).pipe(take(1)).subscribe({
      next: (perfil: PerfilUsuario) => {
        this._profileName.set(perfil?.nombre || this.currentUser()?.email || 'Usuario');
        this._profileAvatarUrl.set(perfil?.fotoPerfil || null);
      },
      error: (err) => {
        // console.error('[DEBUG] AuthService: ¡ERROR! La llamada a getPerfil ha fallado.', err);
        this._profileName.set(this.currentUser()?.email || 'Usuario');
        this._profileAvatarUrl.set(null);
      }
    });
  }

  private clearUserProfile(): void {
    this._profileName.set(null);
    this._profileAvatarUrl.set(null);
  }

  public updateProfileData(data: { nombre?: string, fotoPerfil?: string }): void {
      if (data.nombre) {
          this._profileName.set(data.nombre);
      }
      if (data.fotoPerfil) {
          this._profileAvatarUrl.set(data.fotoPerfil);
      }
  }

  private _updateAuthState(isAuthenticated: boolean, session: Session | null) {
    this._isAuthenticated.set(isAuthenticated);
    this._currentUser.set(session?.user ?? null);
    this._currentSession.set(session);
  }

  private _updateAuthStateOnEvent(event: AuthChangeEvent, session: Session | null) {
    switch (event) {
      case 'SIGNED_IN':
        this.validateAndUpdateAuthState(session).then(() => {
          if (this.isAuthenticated() && this.router.url.includes('/auth')) {
            this.router.navigate(['/']);
          }
        });
        break;
      case 'TOKEN_REFRESHED':
      case 'USER_UPDATED':
         this.validateAndUpdateAuthState(session);
        break;

      case 'SIGNED_OUT':
        this._updateAuthState(false, null);
        this.clearUserProfile();
        this._recoveryEventOccurred.set(false);
        this.router.navigate(['/']);
        break;

      case 'PASSWORD_RECOVERY':
        this._recoveryEventOccurred.set(true);
        break;
    }
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      // console.error('Error al cerrar sesión con Supabase:', error);
    }
  }

  getToken(): string | null {
    const session = this.currentSession();
    return session?.access_token || null;
  }

  async loginWithEmail(email: string, password: string): Promise<{ user: User | null, session: Session | null, error: any }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { user: null, session: null, error };
    }

    if (!data.session || !data.user) {
      return { user: null, session: null, error: { message: 'No se recibió sesión del servidor.' } };
    }

    try {
      const perfil = await firstValueFrom(this.perfilUsuarioService.getPerfil(data.user.id));
      if (perfil.isDeleted) {
        await this.logout();
        return { user: null, session: null, error: { message: 'Esta cuenta ha sido desactivada.' } };
      }

      return { user: data.user, session: data.session, error: null };

    } catch (profileError: any) {
      await this.logout();
      if (profileError instanceof HttpErrorResponse && profileError.status === 404) {
        return { user: null, session: null, error: { message: 'Esta cuenta ha sido desactivada.' } };
      }
      return { user: null, session: null, error: { message: 'No se pudo verificar el perfil de usuario. ' + profileError.message } };
    }
  }


  async registerWithEmail(email: string, password: string, username: string): Promise<{ user: User | null, session: Session | null, error: any }> {
    const { data, error } = await this.supabase.auth.signUp({
      email, password,
      options: { data: { name: username } }
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

  async updateUserMetadata(data: { [key: string]: any }): Promise<{ user: User | null, error: any }> {
    const { data: updatedUserData, error } = await this.supabase.auth.updateUser({ data });
    return { user: updatedUserData.user, error };
  }

  async uploadAvatar(file: File): Promise<{ path: string | null; error: any }> {
    const user = this.currentUser();
    if (!user) return { path: null, error: 'Usuario no autenticado' };

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error } = await this.supabase.storage.from('avatars').upload(filePath, file);

    if (error) {
      // console.error('Error al subir avatar a Supabase Storage:', error);
      return { path: null, error };
    }
    return { path: filePath, error: null };
  }

  getAvatarPublicUrl(path: string): string | null {
    if (!path) return null;
    const { data } = this.supabase.storage.from('avatars').getPublicUrl(path);
    return data?.publicUrl || null;
  }

  async deleteAvatar(path: string): Promise<{ error: any }> {
    const { error } = await this.supabase.storage.from('avatars').remove([path]);
    if (error) {
      // console.error('Error al eliminar el avatar anterior de Supabase Storage:', error);
    }
    return { error };
  }

  getPathFromUrl(url: string, bucketName: string): string | null {
    if (!url) return null;
    const searchString = `/storage/v1/object/public/${bucketName}/`;
    const startIndex = url.indexOf(searchString);

    if (startIndex === -1) {
      // console.warn('No se pudo encontrar el patrón del bucket en la URL del avatar antiguo.');
      return null;
    }

    const path = url.substring(startIndex + searchString.length);
    return path ? decodeURI(path) : null;
  }

  async uploadRecetaImage(file: File, recetaId: string | number): Promise<{ path: string | null; error: any }> {
    const user = this.currentUser();
    if (!user) {
      return { path: null, error: 'Usuario no autenticado para subir imagen de receta.' };
    }

    const fileExt = file.name.split('.').pop();

    const filePath = `${user.id}/${recetaId}/${Date.now()}.${fileExt}`;

    const { error } = await this.supabase.storage.from('imagen-receta').upload(filePath, file, {
      upsert: true
    });

    if (error) {
      // console.error('Error al subir imagen de receta a Supabase Storage:', error);
      return { path: null, error };
    }
    return { path: filePath, error: null };
  }

  getRecetaImagePublicUrl(path: string): string | null {
    if (!path) return null;
    const { data } = this.supabase.storage.from('imagen-receta').getPublicUrl(path);
    return data?.publicUrl || null;
  }

  async deleteRecetaImage(path: string): Promise<{ error: any }> {
    const { error } = await this.supabase.storage.from('imagen-receta').remove([path]);
    if (error) {
      // console.error('Error al eliminar imagen de receta:', error);
    }
    return { error };
  }


}
