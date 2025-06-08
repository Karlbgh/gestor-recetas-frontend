import { Receta } from '../../recetas/models/receta.model';

export type TipoComida = 'Desayuno' | 'Almuerzo' | 'Cena' | 'Snack';

export interface PlanComida {
  id?: string;
  recetaId: string;
  nombreReceta?: string;
  tipoComida: TipoComida;
}

export interface PlanificadorDiario {
  fecha: Date;
  comidas: PlanComida[];
}

export interface PlanificadorSemanal {
  usuarioId: string;
  semanaDel?: Date;
  dias: PlanificadorDiario[];
}


export interface Planificador {
    id?: string;
    usuarioId: string;
    recetaId: string;
    nombreReceta?: string;
    fechaPlanificada: Date;
    tipoComida?: TipoComida;
}
