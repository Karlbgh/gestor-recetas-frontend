export interface Comentario {
  id?: string;
  recetaId: string; // ID de la receta a la que pertenece
  usuarioId: string; // ID del usuario que comenta
  nombreUsuario?: string; // Para mostrar fácilmente, puede venir del backend
  texto: string;
  puntuacion?: number; // ej. 1 a 5 estrellas
  fechaCreacion?: Date;
}
