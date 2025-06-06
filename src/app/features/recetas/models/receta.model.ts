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
export interface RecetaIngrediente {
  IdIngrediente: number;
  nombre: string;
  cantidad: number;
  unidadMedida: string;
  calorias: number;
  grasas: number;
  proteinas: number;
  carbohidratos: number;
  azucares: number;
  sodio: number;

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
  azuacaresTotales?: number;
  sodioTotal?: number;
  creatorId?: number | string;

  // --- Campos para la vista de detalle ---
  ingredientes?: RecetaIngrediente[];
  preparacion?: string;
  tiempoPreparacion?: number;
  nombreCreador?: string;
  comentarios?: Comentario[];
}
