import { Ingrediente } from '../../ingredientes/models/ingrediente.model';

export interface ItemListaCompra {
  ingredienteId: string;
  // ingrediente?: Ingrediente; // Objeto completo si es necesario
  nombreIngrediente: string; // Para mostrar
  cantidad: number;
  unidadMedida: string;
  comprado?: boolean;
  // notas?: string;
}

export interface ListaCompra {
  id?: string;
  usuarioId: string;
  nombre?: string; // ej. "Compra Semanal", "Cena Sábado"
  fechaCreacion?: Date;
  items: ItemListaCompra[];
}
