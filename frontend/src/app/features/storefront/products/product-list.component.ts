import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Produit, Categorie } from '../../../core/services/product.service';
import { ProductCardComponent } from './product-card/product-card.component';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, LucideAngularModule, FormsModule],
  template: `
    <div class="catalog-viewport">
      <!-- Flagship Perspective Grid -->
      <div class="bg-grid"></div>
      
      <!-- High-Fidelity Glow -->
      <div class="fixed inset-0 pointer-events-none z-0">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(251,191,36,0.1),transparent_70%)]"></div>
      </div>

      @if (clientGateVisible()) {
        <div class="client-gate-overlay">
          <div class="client-gate-card">
            <div class="client-gate-loader">ISGAARTI</div>
            <strong>Accès client requis</strong>
            <p>Connectez-vous comme client pour ajouter un produit au panier.</p>
            <span>Redirection vers votre espace sécurisé</span>
          </div>
        </div>
      }

      <div class="catalog-page-inner relative z-10 w-full px-8 pt-12">
        
        <!-- Flagship Header -->
        <header class="catalog-hero">
          <div class="flex items-center gap-4 mb-6">
            <div class="h-[1px] w-12 bg-amber-500/40"></div>
            <span class="text-[9px] font-black text-amber-500 uppercase tracking-[0.4em]">Verified Commerce Grid</span>
          </div>
          
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div>
              <h1 class="catalog-title">
                The <span>Catalog</span>
              </h1>
              <p class="catalog-subtitle">
                <lucide-icon name="shield-check" class="w-4 h-4 text-amber-500"></lucide-icon>
                Curated marketplace for verified hardware, live promotions, and inventory-ready offers.
              </p>
            </div>

            <div class="hero-stats">
              <div class="stat-mini">
                <span class="label">Live Nodes</span>
                <span class="value">{{ products().length }}</span>
              </div>
              <div class="stat-mini">
                <span class="label">Active Promos</span>
                <span class="value text-amber-500">{{ activePromosCount() }}</span>
              </div>
              <div class="stat-mini">
                <span class="label">Classes</span>
                <span class="value">{{ categories().length }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Command Shell -->
        <div class="command-shell">
          
          <!-- Filter Module (Side Panel) -->
          <aside class="filter-module shadow-2xl">
            <div class="filter-header">
              <div>
                <span class="filter-eyebrow">Acquisition Control</span>
                <h2 class="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                <lucide-icon name="sliders-horizontal" class="w-4 h-4 text-amber-500"></lucide-icon>
                Filter Matrix
              </h2>
              </div>
              <button (click)="resetFilters()" class="filter-reset-icon" title="Reset filters">
                <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
              </button>
            </div>

            <div class="filter-body">
              <!-- Search Search -->
              <div class="search-box group">
                <lucide-icon name="search" class="w-4 h-4 text-zinc-600 group-focus-within:text-amber-500 transition-colors"></lucide-icon>
                <input type="text" 
                       [ngModel]="searchQuery()" 
                       (ngModelChange)="searchQuery.set($event)"
                       placeholder="Search Node ID..." 
                       class="search-input">
              </div>

              <!-- Categories -->
              <div class="space-y-5">
                <label class="section-label">Classification</label>
                <div class="space-y-2">
                  <button (click)="setCategory(null)" 
                          [class.active]="!selectedCategory()"
                          class="cat-filter-btn">
                    <span class="dot"></span>
                    ALL_NODES
                  </button>
                  @for (cat of categories(); track cat.id) {
                    <button (click)="setCategory(cat.id)" 
                            [class.active]="selectedCategory() === cat.id"
                            class="cat-filter-btn">
                      <span class="dot"></span>
                      {{ cat.nom.toUpperCase() }}
                    </button>
                  }
                </div>
              </div>

              <!-- Price Matrix -->
              <div class="space-y-5">
                <div class="flex justify-between items-end">
                   <label class="section-label">Budget Cap</label>
                   <span class="text-xs font-mono text-amber-500 font-bold">{{ maxPrice() | currency:'MAD':'symbol':'1.0-0' }}</span>
                </div>
                <input type="range" 
                       [ngModel]="maxPrice()"
                       (ngModelChange)="maxPrice.set($event)"
                       [min]="0" 
                       [max]="maxCatalogPrice()" 
                       step="50"
                       class="tactical-slider">
                <div class="flex justify-between text-[8px] font-black text-zinc-700 tracking-widest">
                  <span>MIN_VALUE</span>
                  <span>MAX_VALUE</span>
                </div>
              </div>

              <!-- Quick Toggles -->
              <div class="filter-toggles">
                <button (click)="togglePromo()" class="tactical-toggle-btn" [class.active]="showOnlyPromo()">
                  <div class="custom-check">
                    <lucide-icon *ngIf="showOnlyPromo()" name="check" class="w-3 h-3 text-black"></lucide-icon>
                  </div>
                  <span class="text-label">Flash Sales Only</span>
                </button>

                <button (click)="toggleStock()" class="tactical-toggle-btn" [class.active]="showInStockOnly()">
                  <div class="custom-check">
                    <lucide-icon *ngIf="showInStockOnly()" name="check" class="w-3 h-3 text-black"></lucide-icon>
                  </div>
                  <span class="text-label">In Stock Nodes</span>
                </button>
              </div>
            </div>
          </aside>

          <!-- Results Grid -->
          <main class="results-container">
            <!-- Grid Tools -->
            <div class="results-toolbar">
              <div class="flex items-center gap-6">
                 <p class="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                   Results Matrix: <span class="text-white">{{ filteredProducts().length }}</span> / {{ products().length }}
                 </p>
              </div>
              
              <div class="flex items-center gap-4">
                 <span class="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Sorting Protocol</span>
                 <select [ngModel]="sortMode()" (ngModelChange)="sortMode.set($event)" class="tactical-select">
                   <option value="default">OPTIMIZED</option>
                   <option value="low">PRICE_LOW</option>
                   <option value="high">PRICE_HIGH</option>
                 </select>
              </div>
            </div>

            @if (isLoading()) {
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                @for (i of [1,2,3,4,5,6,7,8]; track i) {
                  <div class="skeleton-card"></div>
                }
              </div>
            } @else {
              @if (filteredProducts().length === 0) {
                <div class="empty-state">
                   <lucide-icon name="search-x" class="w-16 h-16 text-zinc-800 mb-6"></lucide-icon>
                   <h3 class="text-2xl font-black text-white uppercase tracking-tighter mb-2">Zero Matches Found</h3>
                   <p class="text-zinc-500 font-bold tracking-widest text-[10px] uppercase">Adjustment of search parameters required</p>
                   <button (click)="resetFilters()" class="mt-8 px-6 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Clear Matrix Filters</button>
                </div>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  @for (product of filteredProducts(); track product.id) {
                    <app-product-card [product]="product" (clientRequired)="showClientGate()"></app-product-card>
                  }
                </div>
              }
            }
          </main>
        </div>

        <footer class="catalog-footer">
          <span class="footer-brand">ISGAARTI Store</span>
          <span class="footer-copy">Copyright {{ currentYear }}. All rights reserved.</span>
        </footer>
      </div>
    </div>

    <style>
      :host { display: block; min-height: 100vh; background: #070708; }
      .catalog-viewport { min-height: 100vh; background: #070708; color: #e4e4e7; position: relative; overflow-x: hidden; }
      .client-gate-overlay { position: fixed; inset: 0; z-index: 1200; display: flex; align-items: center; justify-content: center; background: rgba(5,5,6,0.48); backdrop-filter: blur(18px) saturate(1.25); }
      .client-gate-card { width: min(410px, calc(100vw - 34px)); padding: 28px; border-radius: 24px; text-align: center; background: linear-gradient(145deg, rgba(20,20,22,0.96), rgba(6,6,7,0.98)); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 44px 140px rgba(0,0,0,0.66), inset 0 1px 0 rgba(255,255,255,0.1); }
      .client-gate-loader { width: fit-content; margin: 0 auto 18px; color: #fbbf24; font-size: 0.7rem; font-weight: 950; letter-spacing: 0.38em; text-transform: uppercase; animation: rewrite-isgaarti 1.2s steps(8) infinite; overflow: hidden; white-space: nowrap; border-right: 1px solid rgba(251,191,36,0.8); }
      .client-gate-card strong { display: block; color: white; font-size: 1.12rem; font-weight: 950; text-transform: uppercase; }
      .client-gate-card p { margin-top: 9px; color: #a1a1aa; font-size: 0.88rem; font-weight: 750; line-height: 1.55; }
      .client-gate-card span { display: block; margin-top: 16px; color: #fbbf24; font-size: 0.56rem; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; }
      @keyframes rewrite-isgaarti { 0% { width: 0; } 50% { width: 8.5em; } 100% { width: 0; } }
      .catalog-page-inner { padding-bottom: 0; }
      .catalog-hero { margin-bottom: 36px; padding: 30px; border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; background: linear-gradient(135deg, rgba(255,255,255,0.045), rgba(0,0,0,0.2)); box-shadow: 0 28px 80px rgba(0,0,0,0.28); }
      .catalog-title { color: #fff; font-size: clamp(52px, 7vw, 104px); font-weight: 950; letter-spacing: -0.04em; line-height: 0.86; margin-bottom: 18px; }
      .catalog-title span { color: #fbbf24; }
      .catalog-subtitle { max-width: 720px; color: #a1a1aa; font-size: 12px; line-height: 1.8; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; display: flex; align-items: center; gap: 12px; }
      .hero-stats { display: grid; grid-template-columns: repeat(3, minmax(96px, 1fr)); gap: 10px; min-width: min(100%, 430px); }
      
      .stat-mini { display: flex; flex-direction: column; align-items: flex-start; padding: 16px; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; background: rgba(0,0,0,0.28); }
      .stat-mini .label { font-size: 8px; font-weight: 900; color: #52525b; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 4px; }
      .stat-mini .value { font-size: 18px; font-weight: 900; font-family: monospace; color: #fff; line-height: 1; }

      .reset-btn { display: flex; align-items: center; gap: 8px; height: 42px; padding: 0 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: #a1a1aa; transition: 0.3s; }
      .reset-btn:hover { background: #fbbf24; color: #000; border-color: #fbbf24; box-shadow: 0 0 25px rgba(251,191,36,0.25); }

      .command-shell { display: grid; grid-template-columns: 340px 1fr; gap: 28px; align-items: start; }
      
      .filter-module { position: sticky; top: 40px; background: linear-gradient(180deg, rgba(15,15,18,0.96), rgba(6,6,8,0.99)); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; backdrop-filter: blur(40px); overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.34); }
      .filter-module::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(135deg, rgba(251,191,36,0.08), transparent 38%, rgba(255,255,255,0.025)); }
      .filter-header { position: relative; z-index: 1; padding: 22px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; gap: 14px; }
      .filter-eyebrow { display: block; color: #fbbf24; font-size: 8px; font-weight: 950; letter-spacing: 0.28em; text-transform: uppercase; margin-bottom: 8px; }
      .filter-reset-icon { width: 38px; height: 38px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: #71717a; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
      .filter-reset-icon:hover { background: #fbbf24; color: #000; border-color: #fbbf24; }
      .filter-body { position: relative; z-index: 1; padding: 22px; display: flex; flex-direction: column; gap: 34px; }
      .section-label { color: #71717a; font-size: 9px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.28em; display: block; }
      
      .search-box { position: relative; display: flex; align-items: center; height: 52px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 0 16px; gap: 12px; transition: 0.3s; }
      .search-box:focus-within { border-color: rgba(251,191,36,0.5); background: rgba(251,191,36,0.02); box-shadow: 0 0 30px rgba(251,191,36,0.05); }
      .search-input { background: transparent; border: none; outline: none; color: #fff; font-size: 11px; font-weight: 700; width: 100%; letter-spacing: 0.05em; }
      .search-input::placeholder { color: #3f3f46; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }

      .cat-filter-btn { width: 100%; display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 8px; font-size: 10px; font-weight: 900; color: #71717a; transition: 0.25s; text-align: left; border: 1px solid transparent; }
      .cat-filter-btn .dot { width: 4px; height: 4px; border-radius: 50%; background: #27272a; transition: 0.25s; }
      .cat-filter-btn:hover { background: rgba(255,255,255,0.03); color: #a1a1aa; }
      .cat-filter-btn.active { background: rgba(251,191,36,0.08); color: #fbbf24; border-color: rgba(251,191,36,0.18); }
      .cat-filter-btn.active .dot { background: #fbbf24; box-shadow: 0 0 10px #fbbf24; }

      .tactical-slider { appearance: none; width: 100%; height: 4px; background: #18181b; border-radius: 2px; outline: none; }
      .tactical-slider::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #fbbf24; cursor: pointer; border: 3px solid #000; box-shadow: 0 0 15px rgba(251,191,36,0.5); }

      /* Fixed Tactical Toggle Button */
      .filter-toggles { padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 12px; }
      .tactical-toggle-btn {
        width: 100%; display: flex; align-items: center; gap: 12px;
        padding: 12px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; outline: none;
        cursor: pointer; text-align: left;
      }
      .tactical-toggle-btn.active { background: rgba(251,191,36,0.08); border-color: rgba(251,191,36,0.16); }
      .custom-check { width: 18px; height: 18px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; transition: 0.3s; flex-shrink: 0; }
      .tactical-toggle-btn.active .custom-check { background: #fbbf24; border-color: #fbbf24; }
      .text-label { font-size: 10px; font-weight: bold; color: #52525b; transition: 0.25s; text-transform: uppercase; letter-spacing: 0.1em; }
      .tactical-toggle-btn.active .text-label { color: #e4e4e7; }
      .tactical-toggle-btn:hover .text-label { color: #a1a1aa; }

      .tactical-select { 
        appearance: none;
        background: rgba(15,15,18,0.8); 
        border: 1px solid rgba(255,255,255,0.08); 
        border-radius: 8px; 
        padding: 8px 32px 8px 12px; 
        color: #fff; 
        font-size: 10px; 
        font-weight: 900; 
        font-family: monospace;
        letter-spacing: 0.12em; 
        outline: none; 
        cursor: pointer; 
        transition: 0.2s;
        color-scheme: dark; /* Forces dark options on some browsers */
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23fbbf24' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
      }
      .tactical-select:hover { border-color: rgba(251,191,36,0.4); background-color: rgba(251,191,36,0.02); }
      .tactical-select option { background: #0c0c0e; color: #fff; font-family: monospace; padding: 10px; }
      .results-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 18px; padding: 14px 16px; border-radius: 12px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); }

      .empty-state { min-height: 500px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.05); border-radius: 32px; }

      .skeleton-card { height: 380px; background: linear-gradient(110deg, #18181b 8%, #27272a 18%, #18181b 33%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 20px; }
      @keyframes shimmer { to { background-position-x: -200%; } }
      .catalog-footer { margin-top: 34px; padding: 18px 2px; display: flex; align-items: center; justify-content: space-between; gap: 20px; border-top: 1px solid rgba(255,255,255,0.06); color: #71717a; }
      .footer-brand { color: #fbbf24; font-size: 10px; font-weight: 950; letter-spacing: 0.22em; text-transform: uppercase; }
      .footer-copy { color: #71717a; font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; text-align: right; }

      @media (max-width: 1200px) {
        .command-shell { grid-template-columns: 1fr; }
        .filter-module { position: relative; top: 0; }
      }
      @media (max-width: 760px) {
        .catalog-hero { padding: 22px; }
        .hero-stats { grid-template-columns: 1fr; }
        .results-toolbar { flex-direction: column; align-items: stretch; }
        .catalog-footer { flex-direction: column; align-items: flex-start; }
        .footer-copy { text-align: left; }
        .catalog-subtitle { align-items: flex-start; }
      }
    </style>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  currentYear = new Date().getFullYear();

  isLoading = signal(true);
  clientGateVisible = signal(false);
  products = signal<Produit[]>([]);
  categories = signal<Categorie[]>([]);

  // Filter Signals
  searchQuery = signal('');
  selectedCategory = signal<number | null>(null);
  maxPrice = signal(2000);
  showOnlyPromo = signal(false);
  showInStockOnly = signal(false);
  sortMode = signal<'default' | 'low' | 'high'>('default');

  // Computed Values
  activePromosCount = computed(() => this.products().filter(p => p.promo && p.promo > 0).length);
  maxCatalogPrice = computed(() => {
    const highest = this.products().reduce((max, product) => Math.max(max, this.getPrice(product)), 2000);
    return Math.ceil(highest / 500) * 500;
  });

  filteredProducts = computed(() => {
    let result = this.products().filter(p => {
      const matchesSearch = !this.searchQuery() || 
                           p.nom.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                           p.id.toString().includes(this.searchQuery());
      
      const matchesCategory = !this.selectedCategory() || p.categorie?.id === this.selectedCategory();
      
      const currentPrice = p.promo && p.promo > 0 ? p.prix * (1 - p.promo / 100) : p.prix;
      const matchesPrice = currentPrice <= this.maxPrice();
      
      const matchesPromo = !this.showOnlyPromo() || (p.promo && p.promo > 0);
      const matchesStock = !this.showInStockOnly() || p.stock > 0;

      return matchesSearch && matchesCategory && matchesPrice && matchesPromo && matchesStock;
    });

    // Sort logic
    if (this.sortMode() === 'low') {
      result.sort((a, b) => this.getPrice(a) - this.getPrice(b));
    } else if (this.sortMode() === 'high') {
      result.sort((a, b) => this.getPrice(b) - this.getPrice(a));
    }

    return result;
  });

  private getPrice(p: Produit): number {
    return p.promo && p.promo > 0 ? p.prix * (1 - p.promo / 100) : p.prix;
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (data) => {
        console.log('NEXUS_DATA_STREAM:', data);
        this.products.set(data);
        this.maxPrice.set(this.maxCatalogPrice());
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    this.productService.getCategories().subscribe({
      next: (data) => this.categories.set(data)
    });
  }

  setCategory(id: number | null) {
    this.selectedCategory.set(id);
  }

  togglePromo() {
    this.showOnlyPromo.set(!this.showOnlyPromo());
  }

  toggleStock() {
    this.showInStockOnly.set(!this.showInStockOnly());
  }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set(null);
    this.maxPrice.set(this.maxCatalogPrice());
    this.showOnlyPromo.set(false);
    this.showInStockOnly.set(false);
    this.sortMode.set('default');
  }

  showClientGate() {
    if (this.clientGateVisible()) return;
    this.clientGateVisible.set(true);
    setTimeout(() => {
      this.clientGateVisible.set(false);
      this.router.navigate(['/login']);
    }, 3000);
  }
}
