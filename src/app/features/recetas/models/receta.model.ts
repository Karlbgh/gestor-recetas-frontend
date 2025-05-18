import { Ingrediente } from '../../ingredientes/models/ingrediente.model'; // Asumiendo que tendrás este modelo
import { Comentario } from '../../comentarios/models/comentario.model'; // Asumiendo que tendrás este modelo

export interface Receta {
  id?: string; // Generalmente los IDs son string o number desde el backend
  nombre: string;
  descripcion?: string;
  tiempoPreparacion?: number; // En minutos, por ejemplo
  dificultad?: 'Fácil' | 'Media' | 'Difícil'; // O un enum/string
  porciones?: number;
  instrucciones?: string;
  imagenUrl?: string; // Para la URL de la imagen
  usuarioId?: string; // O el tipo de ID que uses para el usuario

  // Información Nutricional (calculada o directa)
  caloriasTotales?: number;
  grasasTotales?: number;
  carbohidratosTotales?: number;
  proteinasTotales?: number;

  // Relaciones
  ingredientes?: RecetaIngrediente[]; // Lista de ingredientes de la receta
  comentarios?: Comentario[]; // Comentarios asociados

  // Campos de auditoría (opcional, si los envías desde el backend)
  // fechaCreacion?: Date;
  // fechaActualizacion?: Date;
}

// Interfaz para la relación Receta-Ingrediente, si necesitas detalles específicos
// como la cantidad del ingrediente EN la receta.
export interface RecetaIngrediente {
  ingredienteId: string;
  // ingrediente?: Ingrediente; // Podrías anidar el objeto Ingrediente completo
  nombreIngrediente?: string; // O solo el nombre para visualización rápida
  cantidad: number;
  unidadMedida: string;
  // notasAdicionales?: string; // ej. "finamente picado"
}
