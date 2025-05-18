export type RolUsuario = 'Administrador' | 'UsuarioRegistrado' | 'Invitado';
export interface PerfilUsuario {
  id: string;
  nombre: string;
  email: string;
  rol?: RolUsuario; // Si manejas roles
  // Otros campos que puedas tener:
  // fechaRegistro?: Date;
  // avatarUrl?: string;
  // preferencias?: any;
}
