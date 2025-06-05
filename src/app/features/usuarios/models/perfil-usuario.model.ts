export type RolUsuario = 'Administrador' | 'UsuarioRegistrado' | 'Invitado';

export interface PerfilUsuario {
  id: string;
  nombre: string;
  email: string;
  rol?: RolUsuario;
  foto_perfil?: string;
}
