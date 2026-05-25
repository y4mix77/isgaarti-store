import { Component, Input, Output, EventEmitter, inject, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Produit } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CurrencyPipe],
  template: `
    <article class="enterprise-node group" [class.on-promo]="hasPromo()" (click)="navigateToDetails()">
      <div class="node-shell">
        
        <div *ngIf="hasPromo()" class="promo-ribbon" (click)="$event.stopPropagation()">
          <div class="ribbon-content">
            <lucide-icon name="zap" class="w-2.5 h-2.5 mr-1"></lucide-icon>
            LIMITED OFFER
          </div>
        </div>

        <div *ngIf="hasPromo()" class="promo-ticket-anchor" (click)="$event.stopPropagation()">
          <div class="promo-ticket">
            <span class="pct">-{{ product.promo }}%</span>
            <span class="label">OFF</span>
            <div class="ticket-perf"></div>
          </div>
        </div>

        <div *ngIf="isFlagship()" class="asset-acquisition-badge">
          <div class="badge-core">
            <lucide-icon name="gem" class="w-3 h-3"></lucide-icon>
            <span>PREMIUM</span>
          </div>
        </div>

        <div class="node-viz" #vizModule>
          <div class="media-topline">
            <strong [class.out]="product.stock === 0">{{ product.stock > 0 ? 'In stock' : 'Out of stock' }}</strong>
          </div>

          <div *ngIf="!activeImage()" class="viz-placeholder">
            <div class="viz-blueprint"></div>
            <lucide-icon name="box" class="w-16 h-16 text-zinc-800 z-10 opacity-20"></lucide-icon>
          </div>
          
          <img *ngIf="activeImage()" [src]="activeImage()" [alt]="product.nom" class="card-img">

          @if (galleryImages().length > 1) {
            <div class="card-gallery-switcher" (click)="$event.stopPropagation()">
              @for (img of galleryImages(); track img; let i = $index) {
                <button
                  class="gallery-switch-node"
                  [class.active]="i === activeImageIndex()"
                  (click)="setActiveImage(i, $event)"
                  [title]="'Visual ' + (i + 1)"
                >
                  <img [src]="img" [alt]="'Visual ' + (i + 1)">
                </button>
              }
            </div>
          }

          <div class="viz-overlay"></div>
          <div class="led-abs" [class.active]="product.stock > 0" [class.off]="product.stock === 0"></div>

          <div class="view-hint">
             <lucide-icon name="eye" class="w-4 h-4"></lucide-icon>
             <span>View details</span>
          </div>
        </div>

        <div class="node-matrix">
          <div class="matrix-header">
            <div class="title-group">
              <span class="matrix-category">Verified marketplace item</span>
              <h3 class="matrix-title">{{ product.nom }}</h3>
            </div>
            
            <div class="price-terminal">
              <span *ngIf="hasPromo()" class="old-price">
                {{ product.prix | currency:'MAD':'symbol':'1.0-0' }}
              </span>
              <span class="current-price" [class.promo-glow]="hasPromo()">
                {{ strikePrice() | currency:'MAD':'symbol':'1.0-0' }}
              </span>
            </div>
          </div>

          <p class="matrix-description">
            {{ product.description || 'Enterprise-ready product with verified marketplace availability.' }}
          </p>

          <div class="utility-bar">
            <div class="node-meta">
              <span class="node-id">SKU-{{ product.id }}</span>
              <span class="status-text" [class.down]="product.stock === 0">
                {{ product.stock > 0 ? product.stock + ' units available' : 'Unavailable' }}
              </span>
            </div>
            
            <div class="actions-group">
              <button (click)="navigateToDetails($event)" class="details-btn" title="View Specifications">
                <span class="text-[8px] font-black mr-2">DETAILS</span>
                <lucide-icon name="arrow-right" class="w-3 h-3"></lucide-icon>
              </button>

              <button (click)="addToCart($event)" [disabled]="product.stock === 0" class="cart-action-btn" title="Add to Acquisition">
                <lucide-icon name="shopping-cart" class="w-4 h-4"></lucide-icon>
              </button>
            </div>
          </div>
        </div>

      </div>

      <style>
        .enterprise-node {
          position: relative; background: #0d0d0f; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; overflow: hidden; cursor: pointer;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          box-shadow: 0 16px 50px rgba(0,0,0,0.34);
          backface-visibility: hidden; transform: translate3d(0, 0, 0);
          will-change: border-color, box-shadow;
        }
        .enterprise-node:hover {
          border-color: rgba(251,191,36,0.32);
          background: #101013;
          box-shadow: 0 24px 70px rgba(0,0,0,0.48);
        }

        .promo-ribbon {
          position: absolute; left: 14px; top: 14px; z-index: 45;
          background: rgba(251,191,36,0.95); color: #000;
          font-size: 8px; font-weight: 950; letter-spacing: 0.12em;
          padding: 6px 9px; border-radius: 999px;
          box-shadow: 0 10px 28px rgba(0,0,0,0.36);
        }
        .ribbon-content { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; line-height: 1; }
        .ribbon-content lucide-icon { flex: 0 0 auto; margin-right: 0; }

        .promo-ticket-anchor { position: absolute; right: 16px; top: 0; z-index: 50; }
        .promo-ticket {
          position: relative; background: #fbbf24; color: #000;
          width: 38px; height: 52px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          font-family: monospace; font-weight: 950;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 90%, 0 100%);
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .promo-ticket .pct { font-size: 12px; line-height: 1; }
        .promo-ticket .label { font-size: 7px; margin-top: 1px; opacity: 0.7; }

        .node-viz { position: relative; height: 270px; background: #f4f4f5; overflow: hidden; margin-bottom: -1px; z-index: 5; }
        .media-topline {
          position: absolute; left: 14px; right: 14px; bottom: 14px; z-index: 34;
          display: flex; justify-content: flex-start; align-items: center; gap: 10px;
          color: #18181b; pointer-events: none;
        }
        .media-topline strong {
          max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          font-size: 8px; font-weight: 950; letter-spacing: 0.12em; text-transform: uppercase;
          border-radius: 999px; padding: 6px 8px; background: rgba(255,255,255,0.82);
          border: 1px solid rgba(24,24,27,0.08); backdrop-filter: blur(16px);
        }
        .media-topline strong { color: #047857; }
        .media-topline strong.out { color: #b91c1c; }
        .card-img { width: 100%; height: 100%; object-fit: cover; opacity: 0.94; transition: transform 0.55s ease, opacity 0.55s ease; }
        .enterprise-node:hover .card-img { opacity: 1; transform: scale(1.02); }
        .viz-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.02) 48%, rgba(12,12,14,0.82)); pointer-events: none; }
        .card-gallery-switcher { position: absolute; left: 14px; top: 50%; z-index: 35; display: flex; flex-direction: column; gap: 7px; align-items: center; justify-content: center; padding: 7px; border-radius: 999px; background: rgba(0,0,0,0.48); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(18px); opacity: 0; transform: translate(-8px, -50%); transition: 0.25s; }
        .node-viz:hover .card-gallery-switcher { opacity: 1; transform: translate(0, -50%); }
        .gallery-switch-node { width: 34px; height: 34px; border-radius: 999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.16); opacity: 0.62; transition: 0.2s; background: #09090b; }
        .gallery-switch-node img { width: 100%; height: 100%; object-fit: cover; }
        .gallery-switch-node:hover, .gallery-switch-node.active { opacity: 1; border-color: rgba(251,191,36,0.75); box-shadow: 0 0 14px rgba(251,191,36,0.18); }

        .view-hint {
          position: absolute; right: 14px; bottom: 14px; background: rgba(12,12,14,0.76);
          display: flex; align-items: center; justify-content: center;
          gap: 8px; opacity: 0; transition: 0.25s; z-index: 35;
          font-size: 9px; font-weight: 900; color: #f4f4f5; letter-spacing: 0.08em;
          text-transform: uppercase; border: 1px solid rgba(255,255,255,0.12); border-radius: 999px; padding: 9px 11px; backdrop-filter: blur(18px);
        }
        .node-viz:hover .view-hint { opacity: 1; }

        .led-abs { position: absolute; left: 16px; top: 16px; width: 6px; height: 6px; border-radius: 50%; background: #27272a; z-index: 20; }
        .led-abs.active { background: #22c55e; box-shadow: 0 0 10px #22c55e; }
        .led-abs.off { background: #ef4444; box-shadow: 0 0 10px #ef4444; }

        .asset-acquisition-badge { position: absolute; top: 14px; right: 14px; z-index: 30; }
        .enterprise-node.on-promo .asset-acquisition-badge { top: 58px; }
        .badge-core {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.86);
          color: #18181b; font-size: 7px; font-weight: 950; letter-spacing: 0.12em;
          padding: 6px 10px; border-radius: 999px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.24);
          border: 1px solid rgba(24,24,27,0.08);
        }

        .node-matrix { position: relative; padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 12px; background: #0d0d0f; z-index: 10; }
        .matrix-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; }
        .matrix-category { font-size: 8px; font-weight: 950; color: #71717a; letter-spacing: 0.14em; text-transform: uppercase; }
        .matrix-title { font-size: 15px; font-weight: 900; color: #f4f4f5; letter-spacing: -0.01em; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .price-terminal { flex-shrink: 0; text-align: right; }
        .old-price { display: block; font-size: 10px; color: #71717a; text-decoration: line-through; font-weight: 800; margin-bottom: 3px; }
        .current-price { font-size: 18px; font-family: monospace; font-weight: 900; color: #f4f4f5; line-height: 1; }
        .current-price.promo-glow { color: #fbbf24; text-shadow: 0 0 15px rgba(251,191,36,0.3); }
        .matrix-description { min-height: 34px; color: #a1a1aa; font-size: 12px; line-height: 1.45; font-weight: 650; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        .utility-bar { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.06); gap: 12px; }
        .node-meta { display: flex; flex-direction: column; gap: 3px; }
        .node-id { font-size: 8px; font-weight: 900; color: #52525b; font-family: monospace; letter-spacing: 0.1em; }
        .status-text { font-size: 8px; font-weight: 950; color: #22c55e; letter-spacing: 0.04em; opacity: 0.82; }
        .status-text.down { color: #ef4444; }

        .actions-group { display: flex; align-items: center; gap: 8px; }
        .details-btn {
          display: flex; align-items: center; height: 38px; padding: 0 14px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; color: #a1a1aa; transition: 0.2s;
        }
        .details-btn:hover { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.2); }

        .cart-action-btn { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; color: #71717a; transition: 0.2s; }
        .cart-action-btn:hover:not(:disabled) { background: #fbbf24; color: #000; border-color: #fbbf24; box-shadow: 0 0 20px rgba(251,191,36,0.4); }
        .cart-action-btn:disabled { opacity: 0.1; }
      </style>
    </article>
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Produit;
  @Output() clientRequired = new EventEmitter<void>();
  @ViewChild('vizModule') vizModule!: ElementRef;
  activeImageIndex = signal(0);
  
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);

  hasPromo(): boolean {
    return this.product && this.product.promo !== undefined && this.product.promo !== null && Number(this.product.promo) > 0;
  }

  isFlagship(): boolean {
    return this.product && this.product.prix > 500;
  }

  strikePrice(): number {
    if (this.hasPromo()) {
      return this.product.prix * (1 - (this.product.promo || 0) / 100);
    }
    return this.product.prix;
  }

  galleryImages(): string[] {
    const raw = this.product?.images;
    const cover = this.product?.image;
    if (!raw) return cover ? [cover] : [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return Array.from(new Set([cover, ...parsed].filter((item): item is string => typeof item === 'string' && !!item)));
      }
    } catch {
      return cover ? [cover] : [];
    }

    return cover ? [cover] : [];
  }

  activeImage(): string {
    const images = this.galleryImages();
    return images[this.activeImageIndex()] || images[0] || '';
  }

  setActiveImage(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.activeImageIndex.set(index);
  }

  navigateToDetails(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.router.navigate(['/produits', this.product.id]);
  }

  addToCart(event: MouseEvent) {
    event.stopPropagation();
    if (!this.canUseCart()) {
      this.clientRequired.emit();
      return;
    }
    this.cartService.addToCart(this.product);
    this.triggerCaptureAnimation();
  }

  private canUseCart(): boolean {
    return this.authService.isAuthenticated() && this.authService.hasRole('ROLE_CLIENT');
  }

  private triggerCaptureAnimation() {
    const viz = this.vizModule.nativeElement;
    const rect = viz.getBoundingClientRect();
    const cartAnchor = document.getElementById('global-cart-anchor');
    if (!cartAnchor) return;
    
    const cartRect = cartAnchor.getBoundingClientRect();
    const phantom = document.createElement('div');
    phantom.className = 'capture-phantom';
    phantom.style.left = `${rect.left + rect.width / 2}px`;
    phantom.style.top = `${rect.top + rect.height / 2}px`;
    phantom.style.width = `${rect.width}px`;
    phantom.style.height = `${rect.height}px`;
    
    const img = viz.querySelector('img');
    if (img) phantom.appendChild(img.cloneNode() as HTMLImageElement);
    
    document.body.appendChild(phantom);
    void phantom.offsetWidth;
    
    requestAnimationFrame(() => {
      phantom.style.left = `${cartRect.left + cartRect.width / 2}px`;
      phantom.style.top = `${cartRect.top + cartRect.height / 2}px`;
      phantom.classList.add('flying');
      setTimeout(() => {
        if (phantom.parentNode) document.body.removeChild(phantom);
        cartAnchor.classList.add('pulse-pop');
        setTimeout(() => cartAnchor.classList.remove('pulse-pop'), 400);
      }, 700);
    });
  }
}
