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
  id: number | string;
  nombre: string;
  descripcion: string;
  // tiempoPreparacion: string; // Ej: "30 minutos", "1 hora", "1h 15min"
  dificultad: 'Fácil' | 'Media' | 'Difícil';
  comensales?: number;
  // instrucciones?: string; // O string[] si son pasos detallados
  imagen?: string; // URL de la imagen de la receta
  // fechaCreacion: Date | string; // Usar string si el backend devuelve así y convertir si es necesario
  // fechaActualizacion?: Date | string;

  // Relaciones y datos anidados
  //creador?: UsuarioSimple; // Información del creador de la receta
  creatorId?: number | string; // Alternativa si solo tienes el ID y necesitas cargar el creador por separado
  // ingredientes: IngredienteEnReceta[];
  // comentarios?: Comentario[];
  // Información Nutricional (calculada o almacenada)
  caloriasTotales?: number;
  grasasTotales?: number;
  proteinasTotales?: number;
  carbohidratosTotales?: number;

  // Campos para la UI que pueden venir del backend o calcularse en el frontend
  // puntuacionMedia?: number; // Puntuación promedio de la receta
  // esFavorito?: boolean; // Indicador si es favorita para el usuario actual
}
