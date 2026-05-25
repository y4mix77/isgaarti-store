import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="relative min-h-screen bg-zinc-950 text-white overflow-hidden pb-32 pt-16 px-6">
      <div class="max-w-4xl mx-auto relative z-10">
        
        <div class="mb-8">
          <a routerLink="/admin" class="inline-flex items-center text-sm font-bold text-zinc-400 hover:text-amber-400 transition-colors mb-6">
            <lucide-icon name="arrow-left" class="w-4 h-4 mr-2"></lucide-icon>
            Back to Control Panel
          </a>
          <h1 class="text-4xl font-extrabold tracking-tight mb-2">Deploy New Product</h1>
          <p class="text-zinc-400">Initialize a new item into the supply stream.</p>
        </div>

        <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-10 md:p-14 shadow-2xl relative overflow-hidden">
          
          <!-- Decorative Background Elements inside form -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            
            <!-- Nom du Produit -->
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center">
                <lucide-icon name="tag" class="w-3 h-3 mr-2"></lucide-icon> Product Name
              </label>
              <input type="text" formControlName="nom" class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium" placeholder="e.g., Ergonomic Graphite Pencil">
            </div>

            <!-- Prix -->
            <div>
              <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center">
                <lucide-icon name="dollar-sign" class="w-3 h-3 mr-2"></lucide-icon> Price ($)
              </label>
              <input type="number" step="0.01" formControlName="prix" class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium" placeholder="0.00">
            </div>

            <!-- Stock -->
            <div>
              <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center">
                <lucide-icon name="package" class="w-3 h-3 mr-2"></lucide-icon> Initial Stock
              </label>
              <input type="number" formControlName="stock" class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium" placeholder="Quantity">
            </div>

            <!-- Categorie (Mock for now) -->
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center">
                <lucide-icon name="layers" class="w-3 h-3 mr-2"></lucide-icon> Category ID
              </label>
              <input type="number" formControlName="categorieId" class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium" placeholder="Enter valid Category ID (e.g. 1)">
              <p class="text-xs text-zinc-500 mt-2">Required: Must map to an existing Categorie in the database.</p>
            </div>

          </div>

          <div class="mt-12 pt-8 border-t border-white/10 flex justify-end">
            <button type="submit" [disabled]="productForm.invalid || isSubmitting" class="group relative px-8 py-4 bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-black rounded-xl font-extrabold text-lg transition-all flex items-center justify-center overflow-hidden w-full md:w-auto">
              <span class="relative flex items-center">
                {{ isSubmitting ? 'Deploying...' : 'Deploy Product' }}
                <lucide-icon *ngIf="!isSubmitting" name="upload-cloud" class="w-5 h-5 ml-2"></lucide-icon>
              </span>
            </button>
          </div>
          
          <div *ngIf="error" class="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-sm font-semibold">
            {{ error }}
          </div>
        </form>

      </div>
    </div>
  `
})
export class ProductFormComponent {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);

  isSubmitting = false;
  error = '';

  productForm: FormGroup = this.fb.group({
    nom: ['', Validators.required],
    prix: ['', [Validators.required, Validators.min(0)]],
    stock: ['', [Validators.required, Validators.min(0)]],
    categorieId: ['', Validators.required]
  });

  onSubmit() {
    if (this.productForm.invalid) return;

    this.isSubmitting = true;
    this.error = '';

    const productData = {
      nom: this.productForm.value.nom,
      prix: this.productForm.value.prix,
      stock: this.productForm.value.stock,
      categorie: {
        id: this.productForm.value.categorieId
      }
    };

    // Note: This relies on the backend endpoint for POST /api/produits
    this.productService.createProduct(productData).subscribe({
      next: () => {
        this.router.navigate(['/admin']);
      },
      error: (err: any) => {
        this.error = 'Failed to deploy product. Ensure category ID exists and you have Vendeur privileges.';
        this.isSubmitting = false;
      }
    });
  }
}
