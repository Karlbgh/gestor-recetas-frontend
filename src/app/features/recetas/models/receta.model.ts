import { Ingrediente } from '../../ingredientes/models/ingrediente.model';
import { Comentario } from '../../comentarios/models/comentario.model';
import { PerfilUsuario } from '../../usuarios/models/perfil-usuario.model';

// Interfaz para la información básica del usuario creador,
// si el backend la envía anidada o si la construyes en el frontend.
export interface UsuarioSimple {
  id: number | string;
  nombre: string;
  // Otros campos relevantes si los necesitas aquí (ej. avatarUrl)
}

// Interfaz para los ingredientes dentro de una receta,
// especificando cantidad y unidad.
export interface IngredienteEnReceta {
  ingredienteId: number | string; // ID del ingrediente
  nombre?: string; // Nombre del ingrediente (puede venir del backend o poblarse)
  cantidad: number;
  unidadMedida: string;
  // ingrediente?: Ingrediente; // Opcional: Objeto Ingrediente completo si se anida
}

export interface Receta {
  idReceta: number | string;
  nombre: string;
  descripcion: string;
  imagen?: string;
  dificultad: 'Fácil' | 'Media' | 'Difícil';
  comensales?: number;
  caloriasTotales?: number;
  grasasTotales?: number;
  proteinasTotales?: number;
  carbohidratosTotales?: number;
  creatorId?: number | string;

  // --- Campos para la vista de detalle ---
  ingredientes?: IngredienteEnReceta[];
  pasos?: string[]; // Pasos de preparación como un array de strings
  tiempoPreparacion?: number; // En minutos
  creador?: UsuarioSimple;
  comentarios?: Comentario[];
}
