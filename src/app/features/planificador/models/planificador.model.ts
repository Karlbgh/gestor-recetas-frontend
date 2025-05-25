import { Receta } from '../../recetas/models/receta.model';

export type TipoComida = 'Desayuno' | 'Almuerzo' | 'Cena' | 'Snack';

export interface PlanComida {
  id?: string; // ID de esta entrada específica del planificador
  recetaId: string;
  // receta?: Receta; // Objeto Receta completo si es necesario
  nombreReceta?: string; // Para mostrar
  tipoComida: TipoComida; // ej. Desayuno, Almuerzo, Cena
  // notas?: string;
}

export interface PlanificadorDiario {
  fecha: Date; // El día específico
  comidas: PlanComida[];
}

export interface PlanificadorSemanal { // O como lo organices
  usuarioId: string;
  semanaDel?: Date; // Lunes de la semana, por ejemplo
  dias: PlanificadorDiario[];
}

// Modelo simplificado basado en tu PlanificadorDto.cs
export interface Planificador {
    id?: string;
    usuarioId: string;
    recetaId: string;
    // receta?: Receta; // Para tener los detalles de la receta
    nombreReceta?: string; // Denormalizado para facilitar la visualización
    fechaPlanificada: Date; // Fecha y quizás hora si es relevante
    tipoComida?: TipoComida; // Desayuno, Almuerzo, Cena
}
