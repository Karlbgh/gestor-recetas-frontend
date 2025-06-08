export interface Comentario {
  id?: string;
  recetaId: string;
  usuarioId: string;
  nombreUsuario?: string;
  texto: string;
  puntuacion?: number;
  fechaCreacion?: Date;
}
