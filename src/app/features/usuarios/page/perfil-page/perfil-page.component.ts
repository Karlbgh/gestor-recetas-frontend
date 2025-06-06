// src/app/features/usuarios/page/perfil-page/perfil-page.component.ts
import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { PerfilUsuarioService } from '../../services/perfil-usuario.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { PerfilUsuario } from '../../models/perfil-usuario.model';

import { AvatarComponent } from '../../components/avatar/avatar.component';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AvatarComponent],
  templateUrl: './perfil-page.component.html',
  styleUrls: ['./perfil-page.component.scss']
})
export class PerfilPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private perfilService = inject(PerfilUsuarioService);
  private authService = inject(AuthService);

  perfil: WritableSignal<PerfilUsuario | null> = signal(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  perfilForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]]
  });

  passwordForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  avatarUrl = this.authService.profileAvatarUrl;

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.isLoading.set(true);

    const idUser = this.authService.currentUser()?.id;
    if (!idUser) {
      this.errorMessage.set('No se pudo identificar al usuario.');
      this.isLoading.set(false);
      return;
    }

    this.perfilService.getPerfil(idUser).subscribe({
      next: (data) => {
        this.perfil.set(data);
        this.perfilForm.patchValue({
          nombre: data.nombre,
          email: data.email
        });

        this.authService.updateProfileData(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('No se pudo cargar el perfil. ' + err.message);
        this.isLoading.set(false);
      }
    });
  }

  async onAvatarUpload(file: File): Promise<void> {
    this.clearMessages();
    this.isLoading.set(true);

    const userId = this.authService.currentUser()?.id;
    if (!userId) {
        this.showError('No se pudo identificar al usuario para la actualización.');
        this.isLoading.set(false);
        return;
    }

    const oldAvatarUrl = this.perfil()?.fotoPerfil;
    //console.log(`Avatar antiguo: ${oldAvatarUrl}`);
    try {
      if (oldAvatarUrl) {
        const oldPath = this.authService.getPathFromUrl(oldAvatarUrl, 'avatars');
        if (oldPath) {
          //console.log(`Intentando eliminar el avatar anterior en la ruta: ${oldPath}`);
          await this.authService.deleteAvatar(oldPath);
        }
      }
      const { path, error: uploadError } = await this.authService.uploadAvatar(file);
      if (uploadError || !path) throw new Error(uploadError?.message || 'Error al subir el avatar.');

      this.authService.loadUserProfile();
      this.showSuccess('¡Avatar actualizado con éxito!');

    } catch (e: any) {
      this.showError(e.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onUpdatePerfil(): Promise<void> {
    if (this.perfilForm.invalid) return;
    this.clearMessages();
    this.isLoading.set(true);

    const userId = this.authService.currentUser()?.id;
    if (!userId) {
        this.showError('No se pudo identificar al usuario para la actualización.');
        this.isLoading.set(false);
        return;
    }

    const nombre = this.perfilForm.value.nombre as string;
    //(`Actualizando perfil de usuario con nombre: ${nombre}`);
    try {
      await this.perfilService.updatePerfil(userId, { nombre}).toPromise();
      this.authService.loadUserProfile();
      this.showSuccess('Perfil actualizado con éxito.');

    } catch (e: any) {
      this.showError(e.message || 'No se pudo actualizar el perfil.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onUpdatePassword(): Promise<void> {
    if (this.passwordForm.invalid) return;
    this.clearMessages();
    this.isLoading.set(true);

    const newPassword = this.passwordForm.value.newPassword as string;

    try {
      const { error } = await this.authService.updateUserPassword(newPassword);
      if (error) throw error;

      this.showSuccess('Contraseña actualizada correctamente.');
      this.passwordForm.reset();

    } catch (e: any) {
      this.showError(e.message || 'No se pudo actualizar la contraseña.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private showSuccess(message: string): void {
      this.successMessage.set(message);
      setTimeout(() => this.successMessage.set(null), 3000);
  }

  private showError(message: string): void {
      this.errorMessage.set(message);
      setTimeout(() => this.errorMessage.set(null), 3000);
  }

  private clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}
