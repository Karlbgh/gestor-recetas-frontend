import { Injectable, signal, WritableSignal, inject, NgZone, computed, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { PerfilUsuarioService } from '../../features/usuarios/services/perfil-usuario.service';
import { PerfilUsuario } from '../../features/usuarios/models/perfil-usuario.model';
import { take } from 'rxjs/operators';

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
    // console.log('[DEBUG] AuthService: Constructor inicializado.');

    this.supabase.auth.getSession().then(({ data: { session } }) => {
      //console.log('[DEBUG] AuthService: getSession completado.', session);
      this._updateAuthState(!!session, session);
      if (session) {
        //console.log('[DEBUG] AuthService: Sesión encontrada, llamando a loadUserProfile.');
        this.loadUserProfile();
      }
    });

    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      //console.log('[DEBUG] AuthService: onAuthStateChange evento:', event);
      this.ngZone.run(() => {
        this._updateAuthStateOnEvent(event, session);
      });
    });
  }

  loadUserProfile(): void {
    //console.log('[DEBUG] AuthService: Iniciando loadUserProfile...');

    if (!this.isAuthenticated()) {
      console.warn('[DEBUG] AuthService: loadUserProfile detenido, usuario no autenticado.');
      return;
    }
    const userId = this.currentUser()?.id;
    //console.log('[DEBUG] AuthService: ID de usuario para la consulta:', userId);

    if (!userId) {
      console.warn('[DEBUG] AuthService: loadUserProfile detenido, no se encontró ID de usuario.');
      return;
    }

    this.perfilUsuarioService.getPerfil(userId).pipe(take(1)).subscribe({
      next: (perfil: PerfilUsuario) => {
       // console.log('[DEBUG] AuthService: Perfil recibido del backend:', JSON.stringify(perfil, null, 2));

        if (perfil && perfil.fotoPerfil) {
         // console.log('[DEBUG] AuthService: "foto_perfil" encontrado con valor:', perfil.fotoPerfil);
        } else {
          console.warn('[DEBUG] AuthService: "foto_perfil" NO encontrado o es nulo en el objeto de perfil recibido.');
        }

        this._profileName.set(perfil?.nombre || this.currentUser()?.email || 'Usuario');
        this._profileAvatarUrl.set(perfil?.fotoPerfil || null);
      },
      error: (err) => {
        console.error('[DEBUG] AuthService: ¡ERROR! La llamada a getPerfil ha fallado.', err);
        this._profileName.set(this.currentUser()?.email || 'Usuario');
        this._profileAvatarUrl.set(null);
      }
    });
  }

  /**
   * Limpia los datos del perfil al cerrar sesión.
   */
  private clearUserProfile(): void {
    this._profileName.set(null);
    this._profileAvatarUrl.set(null);
  }

  /**
   * Permite a otros componentes (como la página de perfil) actualizar el estado del perfil.
   */
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
    //('Auth state change:', event, session);

    switch (event) {
      case 'SIGNED_IN':
      case 'TOKEN_REFRESHED':
      case 'USER_UPDATED':
        this._updateAuthState(true, session);
        this.loadUserProfile();
        if (event === 'SIGNED_IN' && this.router.url.includes('/auth')) {
          this.router.navigate(['/']);
        }
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
      console.error('Error al cerrar sesión con Supabase:', error);
    }
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
      console.error('Error al subir avatar a Supabase Storage:', error);
      return { path: null, error };
    }
    return { path: filePath, error: null };
  }

  getAvatarPublicUrl(path: string): string | null {
    if (!path) return null;
    const { data } = this.supabase.storage.from('avatars').getPublicUrl(path);
    return data?.publicUrl || null;
  }

  /**
   * Elimina un archivo de avatar del storage de Supabase.
   * @param path La ruta del archivo a eliminar dentro del bucket 'avatars'.
   */
  async deleteAvatar(path: string): Promise<{ error: any }> {
    const { error } = await this.supabase.storage.from('avatars').remove([path]);
    if (error) {
      // Lo registramos como un error, pero no necesariamente detiene el flujo del usuario
      console.error('Error al eliminar el avatar anterior de Supabase Storage:', error);
    }
    return { error };
  }

  /**
   * Extrae la ruta del archivo de una URL pública de Supabase Storage.
   * @param url La URL pública completa del archivo.
   * @param bucketName El nombre del bucket donde se almacena el archivo (ej: 'avatars').
   * @returns La ruta del archivo o null si no se puede extraer.
   */
  getPathFromUrl(url: string, bucketName: string): string | null {
    if (!url) return null;
    const searchString = `/storage/v1/object/public/${bucketName}/`;
    const startIndex = url.indexOf(searchString);

    if (startIndex === -1) {
      console.warn('No se pudo encontrar el patrón del bucket en la URL del avatar antiguo.');
      return null;
    }

    const path = url.substring(startIndex + searchString.length);
    return path ? decodeURI(path) : null;
  }
}
