export interface Ingrediente {
  id?: string;
  nombre: string;
  // No es común que un ingrediente "base" tenga cantidad y unidad directamente,
  // eso suele ser parte de la receta (RecetaIngrediente).
  // Pero si tu DTO 'IngredienteDto' lo tiene, inclúyelo.
  // cantidad?: number; // Considera si esto va aquí o en RecetaIngrediente
  // unidadMedida?: string; // Considera si esto va aquí o en RecetaIngrediente

  // Información Nutricional POR UNIDAD ESTÁNDAR del ingrediente (ej. por 100g)
  calorias?: number;
  grasas?: number;
  carbohidratos?: number;
  proteinas?: number;
  // otros campos específicos del ingrediente...
  // categoria?: string; // ej. Lácteo, Vegetal, Carne
}
