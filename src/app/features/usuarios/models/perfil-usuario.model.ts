export type RolUsuario = 'Administrador' | 'UsuarioRegistrado' | 'Invitado';

export interface PerfilUsuario {
  id: string;
  nombre: string;
  email: string;
  rol?: RolUsuario;
  fotoPerfil?: string;
  isDeleted?: boolean;
}

export interface UpdatePerfilPayload {
  nombre?: string;
  fotoPerfil?: string;
}
