// src/app/features/recetas/pages/recipe-edit-page/recipe-edit-page.component.ts
import { Component, OnInit, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { Receta, RecetaIngrediente } from '../../models/receta.model';
import { Ingrediente } from '../../../ingredientes/models/ingrediente.model';
import { RecetaService } from '../../services/receta.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { IngredienteService } from '../../../ingredientes/services/ingrediente.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-recipe-edit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recipe-edit-page.component.html',
  styleUrls: ['./recipe-edit-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeEditPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  private recetaService = inject(RecetaService);
  private ingredienteService = inject(IngredienteService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  recipeForm: FormGroup;
  isEditMode = signal(false);
  isLoading = signal(true);
  pageTitle = computed(() => this.isEditMode() ? 'Editar Receta' : 'Crear Nueva Receta');
  recetaId: string | null = null;
  imagePreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  private originalImageUrl = signal<string | null>(null); // <-- AÑADIDO: Para guardar la URL original

  // --- Inicio: Propiedades para el nuevo autocompletado ---
  private allIngredients = signal<Ingrediente[]>([]); // Almacena la lista completa
  ingredientesSugeridos = signal<Ingrediente[]>([]);   // Almacena las sugerencias filtradas
  activeIngredientIndex = signal<number | null>(null);
  // --- Fin: Propiedades para el nuevo autocompletado ---

  constructor() {
    this.recipeForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      preparacion: ['', [Validators.required]],
      tiempoPreparacion: [30, [Validators.required, Validators.min(1)]],
      dificultad: ['Fácil', Validators.required],
      comensales: [2, [Validators.required, Validators.min(1)]],
      ingredientes: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Carga los datos de la receta si estamos en modo edición
    this.route.paramMap.pipe(
      tap(params => {
        this.recetaId = params.get('id');
        if (this.recetaId) {
          this.isEditMode.set(true);
          this.loadRecetaData(this.recetaId);
        } else {
          this.isEditMode.set(false);
          this.addIngrediente();
          this.isLoading.set(false);
        }
      })
    ).subscribe();

    // Carga TODOS los ingredientes al iniciar el componente para el autocompletado
    this.ingredienteService.getIngredientes().subscribe(ingredientes => {
        this.allIngredients.set(ingredientes);
    });
  }

  // --- Inicio: Nuevos métodos para el autocompletado ---

  /**
   * Se activa cuando el usuario hace foco en un campo de ingrediente.
   * Muestra la lista completa de ingredientes como sugerencia inicial.
   */
  onIngredientFocus(index: number): void {
    this.activeIngredientIndex.set(index);
    this.ingredientesSugeridos.set(this.allIngredients());
  }

  /**
   * Se activa al escribir en el campo. Filtra la lista local de ingredientes.
   */
  onIngredientNameChange(event: Event): void {
    const term = (event.target as HTMLInputElement).value.toLowerCase();

    if (!term) {
      this.ingredientesSugeridos.set(this.allIngredients()); // Si no hay término, mostrar todos
    } else {
      const filtered = this.allIngredients().filter(ing =>
        ing.nombre.toLowerCase().includes(term)
      );
      this.ingredientesSugeridos.set(filtered);
    }
  }

  /**
   * Se llama al seleccionar una sugerencia.
   */
  selectIngrediente(ingrediente: Ingrediente, index: number): void {
    const ingredienteFormGroup = this.ingredientes.at(index) as FormGroup;
    ingredienteFormGroup.patchValue({
      idIngrediente: ingrediente.id,
      nombre: ingrediente.nombre
    });
    this.hideSuggestions();
  }

  /**
   * Oculta la lista de sugerencias, por ejemplo, al perder el foco.
   */
  hideSuggestions(): void {
    setTimeout(() => {
        this.activeIngredientIndex.set(null);
    }, 150);
  }
  // --- Fin: Nuevos métodos para el autocompletado ---

  loadRecetaData(id: string): void {
    this.recetaService.getRecetaById(id).pipe(
      switchMap(receta => {
        this.originalImageUrl.set(receta.imagen || null); // <-- AÑADIDO: Guardamos la URL
        this.imagePreview.set(receta.imagen || null);
        this.recipeForm.patchValue(receta);
        return this.recetaService.getIngredientesPorReceta(id);
      }),
      catchError(error => {
        this.notificationService.show('Error al cargar la receta: ' + error.message, 'error');
        this.router.navigate(['/mis-recetas']);
        return of([]);
      })
    ).subscribe(ingredientes => {
      this.setIngredientes(ingredientes);
      this.isLoading.set(false);
    });
  }

  get ingredientes(): FormArray {
    return this.recipeForm.get('ingredientes') as FormArray;
  }

  createIngredienteGroup(ingrediente: RecetaIngrediente | null = null): FormGroup {
    return this.fb.group({
      idIngrediente: [ingrediente?.idIngrediente || null],
      nombre: [ingrediente?.nombre || '', Validators.required],
      cantidad: [ingrediente?.cantidad || 1, [Validators.required, Validators.min(0.1)]],
      unidadMedida: [ingrediente?.unidadMedida || 'gr', Validators.required],
    });
  }

  addIngrediente(): void {
    this.ingredientes.push(this.createIngredienteGroup());
  }

  removeIngrediente(index: number): void {
    this.ingredientes.removeAt(index);
  }

  setIngredientes(ingredientes: RecetaIngrediente[]): void {
    const ingredienteFGs = ingredientes.map(ing => this.createIngredienteGroup(ing));
    const ingredienteFormArray = this.fb.array(ingredienteFGs);
    this.recipeForm.setControl('ingredientes', ingredienteFormArray);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.notificationService.show('La imagen no puede superar los 2MB.', 'error');
        return;
      }
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.recipeForm.invalid) {
      this.notificationService.show('El formulario no es válido. Revisa los campos.', 'error');
      this.recipeForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formValue = this.recipeForm.value;
    const creatorId = this.authService.currentUser()?.id;

    if (!creatorId) {
        this.notificationService.show('Error de autenticación.', 'error');
        this.isLoading.set(false);
        return;
    }

    const payload: any = {
      ...formValue,
      creatorId: creatorId,
      nombreCreador: this.authService.profileName(),
    };

    payload.Ingredientes = payload.ingredientes.map((ing: any) => ({
        idIngrediente: ing.idIngrediente,
        nombre: ing.nombre,
        cantidad: ing.cantidad,
        unidadMedida: ing.unidadMedida
    }));
    delete payload.ingredientes;


    if (this.isEditMode() && this.recetaId) {
      this.updateRecipe(this.recetaId, payload);
    } else {
      this.createRecipe(payload);
    }
  }

  private async createRecipe(payload: Receta): Promise<void> {
    this.recetaService.createReceta(payload).subscribe({
        next: async (newRecipe) => {
            const file = this.selectedFile();
            if (file && newRecipe.idReceta) {
                try {
                    const { path, error: uploadError } = await this.authService.uploadRecetaImage(file, newRecipe.idReceta);
                    if (uploadError) throw uploadError;

                    const imageUrl = this.authService.getRecetaImagePublicUrl(path!);
                    const updatePayload: Partial<Receta> = { imagen: imageUrl };

                    this.recetaService.updateReceta(newRecipe.idReceta.toString(), updatePayload as Receta).subscribe({
                        next: () => {
                            this.notificationService.show('¡Receta creada con éxito!', 'success');
                            this.router.navigate(['/recetas', newRecipe.idReceta]);
                        },
                        error: (err) => this.handleError(err, "actualizar la receta con la imagen")
                    });
                } catch (e) {
                    this.handleError(e, "subir la imagen");
                }
            } else {
                this.notificationService.show('¡Receta creada con éxito!', 'success');
                this.router.navigate(['/recetas', newRecipe.idReceta]);
            }
        },
        error: (err) => this.handleError(err, "crear la receta")
    });
  }

  private async updateRecipe(id: string, receta: Receta): Promise<void> {
    const file = this.selectedFile();

    if (file) {
        try {

            const oldImageUrl = this.originalImageUrl();
            console.log(`URL de imagen antigua: ${oldImageUrl}`);
            if (oldImageUrl) {
                const oldImagePath = this.authService.getPathFromUrl(oldImageUrl, 'imagen-receta');
                if (oldImagePath) {
                    console.log(`Eliminando imagen antigua: ${oldImagePath}`);
                    const { error: deleteError } = await this.authService.deleteRecetaImage(oldImagePath);
                    if (deleteError) {
                       console.warn("No se pudo eliminar la imagen antigua, se procederá a subir la nueva de todas formas.", deleteError);
                    }
                }
            }

            const { path, error: uploadError } = await this.authService.uploadRecetaImage(file, id);
            if (uploadError) throw uploadError;

            receta.imagen = this.authService.getRecetaImagePublicUrl(path!);

        } catch (e) {
            this.handleError(e, "actualizar la imagen");
            return;
        }
    }

    this.recetaService.updateReceta(id, receta).subscribe({
        next: () => {
            this.notificationService.show('¡Receta actualizada con éxito!', 'success');
            this.router.navigate(['/recetas', id]);
        },
        error: (err) => this.handleError(err, "actualizar la receta")
    });
  }

  private handleError(error: any, context: string): void {
    console.error(`Error al ${context}:`, error);
    this.notificationService.show(`Error al ${context}. Inténtalo de nuevo.`, 'error');
    this.isLoading.set(false);
  }
}
