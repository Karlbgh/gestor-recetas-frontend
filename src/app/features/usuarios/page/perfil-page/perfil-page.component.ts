import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PerfilUsuarioService } from '../../services/perfil-usuario.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { PerfilUsuario, UpdatePerfilPayload } from '../../models/perfil-usuario.model';
import { AvatarComponent } from '../../components/avatar/avatar.component';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AvatarComponent,
    ConfirmationDialogComponent
  ],
  templateUrl: './perfil-page.component.html',
  styleUrls: ['./perfil-page.component.scss']
})
export class PerfilPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private perfilService = inject(PerfilUsuarioService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  perfil: WritableSignal<PerfilUsuario | null> = signal(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  showDeleteConfirmation = signal(false);

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
        this.perfilForm.patchValue({ nombre: data.nombre, email: data.email });
        this.authService.updateProfileData({ nombre: data.nombre, fotoPerfil: data.fotoPerfil });
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

    try {
      const oldAvatarUrl = this.authService.profileAvatarUrl();
      if (oldAvatarUrl) {
        const oldPath = this.authService.getPathFromUrl(oldAvatarUrl, 'avatars');
        if (oldPath) {
          await this.authService.deleteAvatar(oldPath);
        }
      }

      const { path: newPath, error: uploadError } = await this.authService.uploadAvatar(file);
      if (uploadError || !newPath) {
        throw new Error(uploadError?.message || 'Error al subir el nuevo avatar.');
      }

      const newPublicUrl = this.authService.getAvatarPublicUrl(newPath);
      if (!newPublicUrl) {
        throw new Error('No se pudo obtener la URL pública del nuevo avatar.');
      }

      const nombreActualDelForm = this.perfilForm.value.nombre as string;
      const payload: UpdatePerfilPayload = {
        nombre: nombreActualDelForm,
        fotoPerfil: newPublicUrl
      };

      this.perfilService.updatePerfil(userId, payload).subscribe({
          next: () => {
              this.authService.updateProfileData({
                  nombre: nombreActualDelForm,
                  fotoPerfil: newPublicUrl
              });
              this.showSuccess('¡Perfil y avatar actualizados con éxito!');
              this.isLoading.set(false);
          },
          error: (dbError) => {
              this.showError(dbError.message || 'Error al guardar los cambios en la base de datos.');
              this.isLoading.set(false);
          }
      });

    } catch (e: any) {
      this.showError(e.message);
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
    const payload: UpdatePerfilPayload = { nombre };

    this.perfilService.updatePerfil(userId, payload).subscribe({
        next: () => {
            this.authService.updateProfileData({ nombre });
            this.showSuccess('Perfil actualizado con éxito.');
            this.isLoading.set(false);
        },
        error: (e: any) => {
            this.showError(e.message || 'No se pudo actualizar el perfil.');
            this.isLoading.set(false);
        }
    });
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

  onDeleteAccount(): void {
    this.clearMessages();
    this.showDeleteConfirmation.set(true);
  }

  cancelDeleteAccount(): void {
    this.showDeleteConfirmation.set(false);
  }

  confirmDeleteAccount(): void {
    this.showDeleteConfirmation.set(false);
    this.isLoading.set(true);

    const userId = this.authService.currentUser()?.id;
    if (!userId) {
      this.showError('No se pudo identificar al usuario para eliminar la cuenta.');
      this.isLoading.set(false);
      return;
    }

    this.perfilService.deletePerfil(userId).subscribe({
      next: async () => {
        this.notificationService.show('Tu cuenta ha sido eliminada con éxito.', 'success');
        await this.authService.logout();
      },
      error: (err) => {
        this.showError(err.message || 'No se pudo eliminar la cuenta.');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
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
