import { Ingrediente } from '../../ingredientes/models/ingrediente.model';
import { Comentario } from '../../comentarios/models/comentario.model';
import { PerfilUsuario } from '../../usuarios/models/perfil-usuario.model';

export interface UsuarioSimple {
  id: number | string;
  nombre: string;
}

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
  imagen?: string | null;
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
