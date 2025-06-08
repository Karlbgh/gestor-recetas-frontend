import { Ingrediente } from '../../ingredientes/models/ingrediente.model';

export interface ItemListaCompra {
  ingredienteId: string;
  nombreIngrediente: string;
  cantidad: number;
  unidadMedida: string;
  comprado?: boolean;
}

export interface ListaCompra {
  id?: string;
  usuarioId: string;
  nombre?: string;
  fechaCreacion?: Date;
  items: ItemListaCompra[];
}
