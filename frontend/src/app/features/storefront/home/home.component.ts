import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ProductService, Produit } from '../../../core/services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, CurrencyPipe],
  template: `
    <main class="landing-page">
      <div class="bg-grid"></div>
      <div class="hero-light"></div>

      <section class="hero-section">
        <div class="hero-copy">
          <div class="hero-kicker">
            <span></span>
            <strong>ISGAARTI STORE</strong>
          </div>
          <h1>Super </h1>
                    <h1> Store</h1>

          <div class="hero-brand-line">
            <span>Store</span>
            <i></i>
            <span>Orders</span>
            <i></i>
            <span>Vendors</span>
          </div>
          <p>
            Une expérience ecommerce pilotée comme un centre de commande: produits en vitrine, paiement sécurisé, factures premium et suivi clair après chaque achat.
          </p>
          <div class="hero-signals">
            <div><strong> + {{ productCount() }}</strong><span>Références</span></div>
            <div><strong> + {{ inStockCount() }}</strong><span>Disponibles</span></div>
            <div><strong> + {{ promoCount() }}</strong><span>Promos</span></div>
          </div>
          <div class="hero-actions">
            <a routerLink="/produits" class="primary-action">
              Explorer le catalogue
              <lucide-icon name="arrow-right" class="w-4 h-4"></lucide-icon>
            </a>
            <a routerLink="/commandes" class="secondary-action">
              Suivre mes commandes
            </a>
          </div>
        </div>

        <div class="commerce-stage">
          <div class="stage-frame">
            <div class="stage-header">
              <span>ISGAARTI Commerce Deck</span>
              <strong>{{ featuredProducts().length }} produits prêts</strong>
            </div>
            <div class="hero-product-stack">
              @for (product of featuredProducts().slice(0, 3); track product.id; let i = $index) {
                <a [routerLink]="['/produits', product.id]" class="hero-product-card" [style.--i]="i">
                  <img *ngIf="product.image" [src]="product.image" [alt]="product.nom">
                  <div *ngIf="!product.image" class="product-fallback">
                    <lucide-icon name="package" class="w-9 h-9"></lucide-icon>
                  </div>
                  <div>
                    <span>{{ product.categorie?.nom || 'Sélection' }}</span>
                    <strong>{{ product.nom }}</strong>
                    <p>{{ product.prix | currency:'MAD':'symbol':'1.0-0' }}</p>
                  </div>
                </a>
              }
            </div>
            <div class="stage-ticket">
              <lucide-icon name="shield-check" class="w-4 h-4"></lucide-icon>
              <span>Paiement sécurisé · Facture instantanée · Suivi commande</span>
            </div>
          </div>
        </div>
      </section>

      <section class="info-strip">
        <div>
          <lucide-icon name="truck" class="w-5 h-5"></lucide-icon>
          <span>Livraison intelligente</span>
          <strong>Suivi étape par étape</strong>
        </div>
        <div>
          <lucide-icon name="tags" class="w-5 h-5"></lucide-icon>
          <span>Promotions ciblées</span>
          <strong>Codes valides par produit</strong>
        </div>
        <div>
          <lucide-icon name="file-spreadsheet" class="w-5 h-5"></lucide-icon>
          <span>Factures premium</span>
          <strong>PDF prêt après paiement</strong>
        </div>
      </section>

      <section class="featured-section">
        <div class="section-head">
          <div>
            <span>Curated Commerce</span>
            <h2>Produits en vitrine</h2>
          </div>
          <div class="featured-actions">
            <button type="button" (click)="previousFeatured()" [disabled]="featuredProducts().length <= 4" aria-label="Produits précédents">
              <lucide-icon name="chevron-left" class="w-4 h-4"></lucide-icon>
            </button>
            <button type="button" (click)="nextFeatured()" [disabled]="featuredProducts().length <= 4" aria-label="Produits suivants">
              <lucide-icon name="chevron-right" class="w-4 h-4"></lucide-icon>
            </button>
            <a routerLink="/produits">Voir tout</a>
          </div>
        </div>

        <div class="featured-slider">
          @for (product of visibleFeaturedProducts(); track product.id) {
            <a [routerLink]="['/produits', product.id]" class="featured-card">
              <div class="featured-media">
                <img *ngIf="product.image" [src]="product.image" [alt]="product.nom">
                <lucide-icon *ngIf="!product.image" name="package" class="w-10 h-10"></lucide-icon>
                @if (product.promo) {
                  <span class="promo-chip">-{{ product.promo }}%</span>
                }
              </div>
              <div class="featured-body">
                <span>{{ product.categorie?.nom || 'Produit vérifié' }}</span>
                <strong>{{ product.nom }}</strong>
                <div class="featured-meta">
                  <em>{{ product.stock > 0 ? 'En stock' : 'Rupture' }}</em>
                  <p>{{ product.prix | currency:'MAD':'symbol':'1.0-0' }}</p>
                </div>
              </div>
            </a>
          }
        </div>
      </section>

      <section class="experience-section">
        <div class="experience-copy">
          <span>Retail Weather</span>
          <h2>Un signal commercial clair avant chaque achat.</h2>
          <p>
            La page résume l'état réel du magasin comme une météo ecommerce: disponibilité, promotions et intensité de sélection restent visibles sans surcharger l'expérience.
          </p>
        </div>
        <div class="weather-board">
          <div class="weather-orbit">
            <span></span>
            <strong>{{ storeReadiness() }}%</strong>
            <em>Readiness</em>
          </div>
          <div class="weather-data">
            <div><i></i><span>Stock actif</span><strong>{{ inStockCount() }}</strong></div>
            <div><i></i><span>Offres</span><strong>{{ promoCount() }}</strong></div>
            <div><i></i><span>Catalogue</span><strong>{{ productCount() }}</strong></div>
          </div>
        </div>
      </section>

      <footer class="landing-footer">
        <strong>ISGAARTI Store</strong>
        <span>© {{ year }} · copyright</span>
      </footer>
    </main>
  `,
  styles: [`
    .landing-page { position: relative; min-height: 100vh; overflow: hidden; background: #050506; color: white; padding: 54px clamp(18px,4vw,70px) 0; }
    .bg-grid { position: fixed; inset: 0; opacity: 0.045; background-image: linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px); background-size: 84px 84px; mask-image: radial-gradient(circle at center, black, transparent 90%); pointer-events: none; }
    .hero-light { position: fixed; inset: 0; pointer-events: none; background: radial-gradient(circle at 58% 8%, rgba(251,191,36,0.18), transparent 32%), radial-gradient(circle at 18% 18%, rgba(14,165,233,0.12), transparent 26%), radial-gradient(circle at 82% 74%, rgba(255,255,255,0.055), transparent 26%); }
    .hero-section { position: relative; z-index: 1; min-height: calc(100vh - 112px); display: grid; grid-template-columns: minmax(0, 1fr) minmax(430px, 0.76fr); align-items: center; gap: clamp(32px,5vw,86px); }
    .hero-kicker { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 22px; }
    .hero-kicker span { width: 8px; height: 8px; border-radius: 999px; background: #fbbf24; box-shadow: 0 0 18px rgba(251,191,36,0.8); }
    .hero-kicker strong, .section-head span, .experience-copy span { color: #fbbf24; font-size: 0.58rem; font-weight: 950; letter-spacing: 0.34em; text-transform: uppercase; }
    .hero-copy h1 { max-width: 760px; font-size: clamp(4.6rem, 9vw, 9.4rem); line-height: 0.84; letter-spacing: 0; font-weight: 950; margin: 0; background: linear-gradient(106deg, #ffffff 0%, #f8fafc 28%, #fbbf24 58%, #38bdf8 100%); -webkit-background-clip: text; background-clip: text; color: transparent; text-wrap: balance; filter: drop-shadow(0 26px 70px rgba(251,191,36,0.12)); }
    .hero-brand-line { width: fit-content; margin-top: 18px; display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 999px; background: rgba(255,255,255,0.055); border: 1px solid rgba(255,255,255,0.09); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08); }
    .hero-brand-line span { color: #e5e7eb; font-size: 0.58rem; font-weight: 950; letter-spacing: 0.2em; text-transform: uppercase; }
    .hero-brand-line i { width: 5px; height: 5px; border-radius: 999px; background: #fbbf24; box-shadow: 0 0 14px rgba(251,191,36,0.8); }
    .hero-copy p { max-width: 650px; margin-top: 24px; color: #a1a1aa; font-size: clamp(1rem,1.25vw,1.18rem); font-weight: 750; line-height: 1.75; }
    .hero-signals { display: grid; grid-template-columns: repeat(3, minmax(0, 118px)); gap: 10px; margin-top: 24px; }
    .hero-signals div { min-height: 70px; padding: 12px; border-radius: 16px; background: linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.028)); border: 1px solid rgba(255,255,255,0.09); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08); }
    .hero-signals strong { display: block; color: #fbbf24; font-family: monospace; font-size: 1.25rem; font-weight: 950; }
    .hero-signals span { display: block; margin-top: 4px; color: #71717a; font-size: 0.56rem; font-weight: 950; letter-spacing: 0.14em; text-transform: uppercase; }
    .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
    .primary-action, .secondary-action { min-height: 52px; padding: 0 20px; border-radius: 15px; display: inline-flex; align-items: center; gap: 10px; font-size: 0.78rem; font-weight: 950; letter-spacing: 0.12em; text-transform: uppercase; transition: 0.2s ease; }
    .primary-action { background: #fbbf24; color: #050506; box-shadow: 0 22px 54px rgba(251,191,36,0.16); }
    .secondary-action { color: white; background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.08); }
    .primary-action:hover, .secondary-action:hover { transform: translateY(-2px); }
    .commerce-stage { position: relative; perspective: 1200px; }
    .stage-frame { position: relative; min-height: 620px; border-radius: 24px; padding: 18px; background: linear-gradient(145deg, rgba(20,20,22,0.9), rgba(6,6,7,0.96)); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 40px 120px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.08); overflow: hidden; transform: rotateY(-5deg) rotateX(3deg); }
    .stage-frame::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(251,191,36,0.14), transparent 34%, rgba(255,255,255,0.035)); pointer-events: none; }
    .stage-header, .stage-ticket { position: relative; z-index: 2; display: flex; justify-content: space-between; gap: 12px; align-items: center; padding: 13px 15px; border-radius: 16px; background: rgba(0,0,0,0.32); border: 1px solid rgba(255,255,255,0.07); }
    .stage-header span, .stage-ticket span { color: #71717a; font-size: 0.6rem; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; }
    .stage-header strong { color: white; font-size: 0.72rem; font-weight: 950; text-transform: uppercase; }
    .hero-product-stack { position: relative; z-index: 1; display: grid; gap: 14px; margin-top: 54px; }
    .hero-product-card { display: grid; grid-template-columns: 132px 1fr; gap: 16px; align-items: center; min-height: 150px; padding: 12px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); transform: translateX(calc(var(--i) * 24px)); transition: 0.25s ease; }
    .hero-product-card:hover { transform: translateX(calc(var(--i) * 24px)) translateY(-4px); border-color: rgba(251,191,36,0.28); }
    .hero-product-card img, .product-fallback { width: 132px; height: 126px; border-radius: 16px; object-fit: cover; background: #09090b; color: #71717a; display: flex; align-items: center; justify-content: center; }
    .hero-product-card span, .featured-body span { display: block; color: #71717a; font-size: 0.58rem; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; }
    .hero-product-card strong { display: block; margin-top: 8px; color: white; font-size: 1.2rem; font-weight: 950; line-height: 1.05; text-transform: uppercase; }
    .hero-product-card p { margin-top: 12px; color: #fbbf24; font-family: monospace; font-size: 1rem; font-weight: 950; }
    .stage-ticket { margin-top: 30px; justify-content: center; color: #fbbf24; }
    .info-strip { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 30px 0 94px; }
    .info-strip div, .featured-card, .experience-section { background: rgba(18,18,20,0.74); border: 1px solid rgba(255,255,255,0.08); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 26px 70px rgba(0,0,0,0.28); }
    .info-strip div { min-height: 108px; border-radius: 18px; padding: 18px; display: grid; gap: 8px; align-content: center; }
    .info-strip lucide-icon { color: #fbbf24; }
    .info-strip span { color: #71717a; font-size: 0.58rem; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; }
    .info-strip strong { color: white; font-size: 0.92rem; font-weight: 950; }
    .featured-section, .experience-section, .landing-footer { position: relative; z-index: 1; }
    .section-head { display: flex; align-items: end; justify-content: space-between; gap: 18px; margin-bottom: 20px; }
    .section-head h2, .experience-copy h2 { margin-top: 10px; color: white; font-size: clamp(2.4rem, 5vw, 5rem); line-height: 0.96; font-weight: 950; letter-spacing: 0; }
    .featured-actions { display: flex; align-items: center; gap: 8px; }
    .featured-actions button { width: 38px; height: 38px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; color: white; background: rgba(255,255,255,0.055); border: 1px solid rgba(255,255,255,0.1); transition: 0.2s ease; }
    .featured-actions button:hover:not(:disabled) { color: #050506; background: #fbbf24; transform: translateY(-2px); }
    .featured-actions button:disabled { opacity: 0.28; cursor: not-allowed; }
    .featured-actions a { margin-left: 8px; color: #fbbf24; font-size: 0.72rem; font-weight: 950; letter-spacing: 0.16em; text-transform: uppercase; }
    .featured-slider { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; min-height: 334px; }
    .featured-card { position: relative; width: 100%; border-radius: 16px; overflow: hidden; transition: 0.22s ease; justify-self: stretch; isolation: isolate; }
    .featured-card::after { content: ''; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(145deg, rgba(251,191,36,0.14), transparent 36%, rgba(56,189,248,0.08)); opacity: 0; transition: 0.22s ease; pointer-events: none; }
    .featured-card:hover { transform: translateY(-4px); border-color: rgba(251,191,36,0.25); }
    .featured-card:hover::after { opacity: 1; }
    .featured-media { position: relative; aspect-ratio: 1.42; background: #09090b; display: flex; align-items: center; justify-content: center; color: #71717a; overflow: hidden; }
    .featured-media img { width: 100%; height: 100%; object-fit: cover; transition: 0.3s ease; }
    .featured-card:hover img { transform: scale(1.04); }
    .promo-chip { position: absolute; left: 10px; top: 10px; padding: 5px 8px; border-radius: 999px; background: #fbbf24; color: #050506; font-size: 0.58rem; font-weight: 950; box-shadow: 0 12px 30px rgba(251,191,36,0.2); }
    .featured-body { padding: 12px; }
    .featured-body strong { display: -webkit-box; min-height: 38px; margin-top: 7px; color: white; font-size: 0.86rem; font-weight: 950; line-height: 1.12; text-transform: uppercase; overflow: hidden; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .featured-meta { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.07); }
    .featured-body em { color: #22c55e; font-size: 0.62rem; font-weight: 950; font-style: normal; text-transform: uppercase; }
    .featured-body p { color: #fbbf24; font-family: monospace; font-weight: 950; }
    .experience-section { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(320px, 0.58fr); gap: 22px; align-items: center; margin-top: 58px; padding: 24px; border-radius: 22px; position: relative; overflow: hidden; }
    .experience-section::before { content: ''; position: absolute; inset: 0; background: linear-gradient(120deg, rgba(251,191,36,0.09), transparent 34%, rgba(14,165,233,0.08)); pointer-events: none; }
    .experience-copy, .weather-board { position: relative; z-index: 1; }
    .experience-copy p { max-width: 680px; margin-top: 18px; color: #8a8a93; font-weight: 780; line-height: 1.75; }
    .weather-board { min-height: 190px; display: grid; grid-template-columns: 150px 1fr; gap: 14px; align-items: center; padding: 16px; border-radius: 20px; background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03)); border: 1px solid rgba(255,255,255,0.1); box-shadow: inset 0 1px 0 rgba(255,255,255,0.12); }
    .weather-orbit { position: relative; width: 138px; height: 138px; border-radius: 999px; display: grid; place-items: center; text-align: center; background: radial-gradient(circle, rgba(251,191,36,0.18), rgba(255,255,255,0.035) 58%, transparent 59%), conic-gradient(from 220deg, #fbbf24, #22c55e, #38bdf8, rgba(255,255,255,0.16), #fbbf24); }
    .weather-orbit span { position: absolute; inset: 9px; border-radius: inherit; background: #080809; }
    .weather-orbit strong, .weather-orbit em { position: relative; z-index: 1; grid-column: 1; }
    .weather-orbit strong { align-self: end; color: white; font-family: monospace; font-size: 1.9rem; font-weight: 950; }
    .weather-orbit em { align-self: start; color: #fbbf24; font-style: normal; font-size: 0.56rem; font-weight: 950; letter-spacing: 0.16em; text-transform: uppercase; }
    .weather-data { display: grid; gap: 8px; }
    .weather-data div { display: grid; grid-template-columns: 10px 1fr auto; align-items: center; gap: 9px; min-height: 42px; padding: 9px 10px; border-radius: 13px; background: rgba(0,0,0,0.24); border: 1px solid rgba(255,255,255,0.07); }
    .weather-data i { width: 8px; height: 8px; border-radius: 999px; background: #fbbf24; box-shadow: 0 0 0 5px rgba(251,191,36,0.11); }
    .weather-data div:nth-child(2) i { background: #22c55e; box-shadow: 0 0 0 5px rgba(34,197,94,0.11); }
    .weather-data div:nth-child(3) i { background: #38bdf8; box-shadow: 0 0 0 5px rgba(56,189,248,0.11); }
    .weather-data span { color: #71717a; font-size: 0.56rem; font-weight: 950; letter-spacing: 0.14em; text-transform: uppercase; }
    .weather-data strong { color: white; font-family: monospace; font-size: 1rem; font-weight: 950; }
    .landing-footer { margin-top: 34px; padding: 18px 0 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px; border-top: 1px solid rgba(255,255,255,0.06); color: #71717a; font-size: 0.72rem; font-weight: 850; }
    .landing-footer strong { color: white; letter-spacing: 0.12em; text-transform: uppercase; }
    @media (max-width: 1120px) { .hero-section, .experience-section { grid-template-columns: 1fr; } .stage-frame { transform: none; min-height: auto; } .featured-slider { grid-template-columns: repeat(2, minmax(0, 1fr)); min-height: auto; } .featured-card { max-width: none; } }
    @media (max-width: 720px) { .landing-page { padding-inline: 18px; } .info-strip, .featured-slider, .weather-board, .hero-signals, .hero-ledger { grid-template-columns: 1fr; } .hero-copy h1 { font-size: clamp(3.45rem, 18vw, 5.4rem); } .hero-brand-line { flex-wrap: wrap; border-radius: 18px; } .weather-orbit { margin-inline: auto; } .hero-product-card { grid-template-columns: 96px 1fr; transform: none; } .hero-product-card:hover { transform: translateY(-3px); } .hero-product-card img, .product-fallback { width: 96px; height: 96px; } .section-head, .landing-footer { flex-direction: column; align-items: flex-start; } }
  `]
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  products = signal<Produit[]>([]);
  featuredSlide = signal(0);
  year = new Date().getFullYear();
  featuredProducts = computed(() => this.products().filter(product => product.stock > 0));
  visibleFeaturedProducts = computed(() => {
    const products = this.featuredProducts();
    const size = Math.min(4, products.length);
    if (products.length <= size) {
      return products;
    }

    return Array.from({ length: size }, (_, index) => products[(this.featuredSlide() + index) % products.length]);
  });
  productCount = computed(() => this.products().length);
  promoCount = computed(() => this.products().filter(product => !!product.promo).length);
  inStockCount = computed(() => this.products().filter(product => product.stock > 0).length);
  storeReadiness = computed(() => {
    const total = Math.max(this.productCount(), 1);
    return Math.round((this.inStockCount() / total) * 100);
  });

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: products => this.products.set(products || []),
      error: () => this.products.set([])
    });
  }

  nextFeatured() {
    const total = this.featuredProducts().length;
    if (total <= 4) return;
    this.featuredSlide.update(index => (index + 1) % total);
  }

  previousFeatured() {
    const total = this.featuredProducts().length;
    if (total <= 4) return;
    this.featuredSlide.update(index => (index - 1 + total) % total);
  }
}
