import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService, Produit } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { delay } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, CurrencyPipe],
  template: `
    <div class="enterprise-viewport">
      <!-- Dynamic Environmental Layers -->
      <div class="bg-grid"></div>
      <div class="glow-layer"></div>

      @if (clientGateVisible()) {
        <div class="client-gate-overlay">
          <div class="client-gate-card">
            <div class="client-gate-loader">ISGAARTI</div>
            <strong>Accès client requis</strong>
            <p>Connectez-vous comme client pour ajouter ce produit au panier.</p>
          </div>
        </div>
      }

      @if (isLoading()) {
        <div class="sync-overlay">
           <div class="sync-loader">
             <div class="sync-scanner"></div>
             <span class="sync-text">Chargement de la fiche produit...</span>
           </div>
        </div>
      } @else if (product()) {
        
        <main class="product-detail-shell relative z-10">
          
          <!-- Tactical Header & Breadcrumb -->
          <div class="flex items-center justify-between mb-12">
            <nav class="breadcrumb">
              <a routerLink="/produits" class="flex items-center gap-2">
                <lucide-icon name="arrow-left" class="w-4 h-4"></lucide-icon>
                <span>Retour au catalogue</span>
              </a>
              <span class="divider">/</span>
              <span class="path">{{ product()?.categorie?.nom }}</span>
              <span class="divider">/</span>
              <span class="active">Produit {{ product()?.id }}</span>
            </nav>
            <div class="system-status">
               <span class="pulse-led"></span>
               Produit vérifié
            </div>
          </div>

          <div class="main-matrix">
            
            <!-- Left: Flagship Asset Visualizer Stage -->
            <div class="visual-terminal">
              <div class="asset-stage">
                <div class="stage-ambient-glow"></div>
                <div class="stage-scan-line"></div>
                
                <div class="asset-frame group">
                  <div class="blueprint-overlay"></div>
                  <img *ngIf="selectedImage()" [src]="selectedImage()" [alt]="product()?.nom" class="main-asset">
                  
                  <!-- HUD Overlays -->
                  <div class="hud-layer">
                     <div class="reticle-tl"></div>
                     <div class="reticle-tr"></div>
                     <div class="reticle-bl"></div>
                     <div class="reticle-br"></div>
                     
                     <div class="telemetry-box">
                        <div class="line">Galerie produit</div>
                        <div class="line">Photos vendeur</div>
                        <div class="line">Référence: #{{ product()?.id }}</div>
                     </div>
                  </div>
                </div>

                <!-- Secondary Perspectives -->
                <div class="perspective-strip mt-6">
                  @for (img of galleryImages(); track img; let i = $index) {
                    <button class="p-node" [class.active]="i === selectedImageIndex()" (click)="selectedImageIndex.set(i)">
                      <img [src]="img" class="w-full h-full object-cover">
                      <span class="p-node-index">{{ (i + 1).toString().padStart(2, '0') }}</span>
                    </button>
                  }
                  @if (!galleryImages().length) {
                    <div class="p-node active">
                      <div class="placeholder-icon"><lucide-icon name="box" class="w-4 h-4"></lucide-icon></div>
                    </div>
                  }
                </div>
              </div>

              <!-- Promotional Coupon Terminal (REAL DATA) -->
              <div class="coupon-terminal mt-8" *ngIf="product()?.promo">
                <div class="terminal-hdr">
                   <lucide-icon name="ticket" class="w-3 h-3 text-amber-500"></lucide-icon>
                   Offre promotionnelle disponible
                </div>
                <div class="coupon-box mt-4">
                   <div class="coupon-info">
                      <span class="l">Réduction active</span>
                      <span class="v text-amber-500">-{{ product()?.promo }}% sur ce produit</span>
                   </div>
                   <div class="coupon-action">
                      <div class="code-shell">
                         <span class="code">{{ product()?.promoCode || product()?.promoName || 'Aucun code' }}</span>
                         <button (click)="copyCode()" class="copy-btn">
                            <lucide-icon [name]="copied() ? 'check' : 'copy'" class="w-3.5 h-3.5"></lucide-icon>
                         </button>
                      </div>
                      <span class="terms">Promotion: {{ product()?.promoName || 'Offre spéciale' }}</span>
                   </div>
                </div>
              </div>
            </div>

            <!-- Right: Specification & Acquisition Matrix -->
            <div class="info-terminal">
              
              <div class="product-info-strip">
                 <div class="product-tags">
                    <span class="tag-gold">Produit vérifié</span>
                    <span *ngIf="product()?.promo" class="tag-red">Offre active: -{{ product()?.promo }}%</span>
                    <span class="tag-zinc">Réf. {{ product()?.id }}</span>
                 </div>
                 <div class="product-quick-facts">
                    <span>Catégorie: <strong>{{ product()?.categorie?.nom }}</strong></span>
                    <span>Disponibilité: <strong [class.out]="(product()?.stock ?? 0) === 0">
                      {{ (product()?.stock ?? 0) > 0 ? product()?.stock + ' articles en stock' : 'Rupture de stock' }}
                    </strong></span>
                 </div>
              </div>

              <h1 class="title">{{ product()?.nom }}</h1>
              <div class="description-card">
                <div class="description-head">
                  <div>
                    <span>Description produit</span>
                  </div>
                  <lucide-icon name="sparkles" class="w-5 h-5"></lucide-icon>
                </div>
                <p>{{ product()?.description || fallbackDescription() }}</p>
                <div class="description-points">
                  <div>
                    <lucide-icon name="shield-check" class="w-4 h-4"></lucide-icon>
                    <span>Produit vérifié</span>
                  </div>
                  <div>
                    <lucide-icon name="truck" class="w-4 h-4"></lucide-icon>
                    <span>Préparé par le vendeur</span>
                  </div>
                  <div>
                    <lucide-icon name="file-spreadsheet" class="w-4 h-4"></lucide-icon>
                    <span>Facture disponible</span>
                  </div>
                </div>
              </div>

              <!-- Light Flagship Authority Card -->
              <div class="authority-light-card mt-10">
                 <div class="flex items-center gap-6">
                    <div class="mini-signature">
                       {{ (product()?.vendeur?.nom || 'N')[0].toUpperCase() }}
                    </div>
                    
                    <div class="flex-1">
                       <div class="flex items-center justify-between mb-1">
                          <span class="auth-tag">Vendeur vérifié</span>
                          <span class="id-tag">Boutique #{{ product()?.vendeur?.id || '---' }}</span>
                       </div>
                       <h4 class="auth-name">{{ product()?.vendeur?.nom || 'Vendeur ISGAARTI' }}</h4>
                    </div>

                    <div class="inventory-node">
                       <span class="l">Produits en boutique</span>
                       <span class="v">{{ product()?.vendeur?.productCount || 0 }} articles</span>
                    </div>
                 </div>
              </div>

              <!-- Premium Purchase Panel -->
              <div class="purchase-panel mt-10">
                <div class="purchase-body">
                   <div class="purchase-topline">
                      <div>
                         <span class="price-label">Prix total</span>
                         <div class="price-row">
                            <strong>{{ totalFinalPrice() | currency:'MAD':'symbol':'1.2-2' }}</strong>
                            <em>MAD</em>
                         </div>
                      </div>

                      <div class="quantity-control">
                         <button (click)="updateQuantity(-1)" [disabled]="quantity() <= 1" class="step-btn">-</button>
                         <span class="step-val">{{ quantity() }}</span>
                         <button (click)="updateQuantity(1)" [disabled]="quantity() >= (product()?.stock || 0)" class="step-btn">+</button>
                      </div>
                   </div>

                   <div class="price-breakdown">
                      <div>
                         <span>Articles</span>
                         <strong>{{ (product()?.prix ?? 0) * quantity() | currency:'MAD':'symbol':'1.2-2' }}</strong>
                      </div>
                      <div *ngIf="product()?.promo" class="promo">
                         <span>Remise</span>
                         <strong>-{{ totalRebate() | currency:'MAD':'symbol':'1.2-2' }}</strong>
                      </div>
                      <div>
                         <span>Livraison</span>
                         <strong>Calculée au panier</strong>
                      </div>
                   </div>

                   <div class="purchase-actions">
                      <button (click)="addToCart()" [disabled]="(product()?.stock ?? 0) === 0" class="acquire-btn">
                         <lucide-icon name="shopping-cart" class="w-4 h-4"></lucide-icon>
                         <span>Ajouter au panier</span>
                      </button>
                      <span class="purchase-note">Prix final calculé avec la quantité sélectionnée.</span>
                   </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Flagship Minimalist Footer -->
          <footer class="node-footer">
             <div class="flex items-center justify-between">
                <div class="footer-brand">
                   ISGAARTI Store
                </div>
                <div class="footer-meta">
                   Copyright {{ currentYear }}. All rights reserved.
                </div>
             </div>
          </footer>

        </main>
      }
    </div>
  `,
  styles: [`
    .enterprise-viewport { min-height: 100vh; background: #070708; color: #fff; position: relative; overflow-x: hidden; font-family: 'Inter', sans-serif; }
    .product-detail-shell { width: 100%; max-width: none; margin: 0; padding: 96px clamp(24px, 4vw, 64px) 0; }
    .client-gate-overlay { position: fixed; inset: 0; z-index: 1200; display: flex; align-items: center; justify-content: center; background: rgba(5,5,6,0.46); backdrop-filter: blur(16px) saturate(1.25); }
    .client-gate-card { width: min(390px, calc(100vw - 34px)); padding: 26px; border-radius: 24px; text-align: center; background: linear-gradient(145deg, rgba(20,20,22,0.96), rgba(6,6,7,0.98)); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 40px 130px rgba(0,0,0,0.64), inset 0 1px 0 rgba(255,255,255,0.1); }
    .client-gate-loader { width: fit-content; margin: 0 auto 18px; color: #fbbf24; font-size: 0.7rem; font-weight: 950; letter-spacing: 0.38em; text-transform: uppercase; animation: rewrite-isgaarti 1.2s steps(8) infinite; overflow: hidden; white-space: nowrap; border-right: 1px solid rgba(251,191,36,0.8); }
    .client-gate-card strong { display: block; color: white; font-size: 1.1rem; font-weight: 950; text-transform: uppercase; }
    .client-gate-card p { margin-top: 9px; color: #a1a1aa; font-size: 0.86rem; font-weight: 750; line-height: 1.55; }
    @keyframes rewrite-isgaarti { 0% { width: 0; } 50% { width: 8.5em; } 100% { width: 0; } }
    
    .bg-grid { position: fixed; inset: 0; opacity: 0.05; z-index: 0; pointer-events: none;
      background-image: linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px);
      background-size: 80px 80px; mask-image: radial-gradient(circle at center, black, transparent 90%);
    }
    .glow-layer { position: fixed; top: -10%; right: -5%; width: 60vw; height: 60vh; background: radial-gradient(circle, rgba(251,191,36,0.06), transparent 70%); z-index: 0; }

    /* Sync Loader */
    .sync-overlay { position: fixed; inset: 0; background: #070708; z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .sync-loader { display: flex; flex-direction: column; align-items: center; gap: 24px; }
    .sync-scanner { width: 140px; height: 2px; background: rgba(255,255,255,0.05); position: relative; overflow: hidden; border-radius: 99px; }
    .sync-scanner::after { content: ''; position: absolute; left: -100%; top: 0; width: 100%; height: 100%; background: #fbbf24; box-shadow: 0 0 15px #fbbf24; animation: sync-move 1.5s infinite; }
    @keyframes sync-move { to { left: 100%; } }
    .sync-text { font-size: 9px; font-weight: 950; letter-spacing: 0.4em; color: #fbbf24; }

    /* Breadcrumb */
    .breadcrumb { display: flex; align-items: center; gap: 16px; font-size: 10px; font-weight: 900; letter-spacing: 0.2em; color: #52525b; text-transform: uppercase; }
    .breadcrumb a { color: #52525b; transition: 0.3s; }
    .breadcrumb a:hover { color: #fff; }
    .breadcrumb .active { color: #fbbf24; }
    .breadcrumb .divider { color: #27272a; }

    .system-status { display: flex; align-items: center; gap: 10px; font-size: 9px; font-weight: 950; color: #3f3f46; letter-spacing: 0.1em; }
    .pulse-led { width: 4px; height: 4px; border-radius: 50%; background: #fbbf24; box-shadow: 0 0 10px #fbbf24; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

    .main-matrix { display: grid; grid-template-columns: minmax(360px, 0.78fr) minmax(0, 1.22fr); gap: clamp(44px, 5vw, 92px); align-items: start; }

    /* Asset Visualizer Stage */
    .asset-stage { position: relative; }
    .stage-ambient-glow { position: absolute; inset: -20%; background: radial-gradient(circle, rgba(251,191,36,0.05), transparent 70%); pointer-events: none; }
    .asset-frame { position: relative; width: min(100%, 560px); aspect-ratio: 1/0.92; background: #0c0c0e; border: 1px solid rgba(255,255,255,0.06); border-radius: 28px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    .blueprint-overlay { position: absolute; inset: 0; opacity: 0.05; background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 30px 30px; z-index: 5; pointer-events: none; }
    .main-asset { width: 100%; height: 100%; object-fit: cover; z-index: 10; filter: contrast(1.05) brightness(0.9); transition: 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    .asset-frame:hover .main-asset { transform: scale(1.1); filter: contrast(1.1) brightness(1); }

    /* HUD Overlays */
    .hud-layer { position: absolute; inset: 24px; pointer-events: none; z-index: 20; }
    .reticle-tl, .reticle-tr, .reticle-bl, .reticle-br { position: absolute; width: 12px; height: 12px; border: 1px solid #fbbf24; opacity: 0.2; }
    .reticle-tl { top: 0; left: 0; border-right: none; border-bottom: none; }
    .reticle-tr { top: 0; right: 0; border-left: none; border-bottom: none; }
    .reticle-bl { bottom: 0; left: 0; border-right: none; border-top: none; }
    .reticle-br { bottom: 0; right: 0; border-left: none; border-top: none; }
    
    .telemetry-box { position: absolute; bottom: 0; left: 0; font-size: 7px; font-weight: 950; font-family: monospace; color: #3f3f46; letter-spacing: 0.1em; display: flex; flex-direction: column; gap: 4px; }

    .perspective-strip { display: flex; gap: 16px; }
    .p-node { position: relative; width: 64px; height: 64px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: 0.3s; }
    .p-node.active { border-color: #fbbf24; background: rgba(251,191,36,0.05); }
    .p-node:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.2); }
    .p-node img { opacity: 0.58; transition: 0.25s; }
    .p-node.active img, .p-node:hover img { opacity: 1; }
    .p-node-index { position: absolute; left: 5px; top: 5px; background: rgba(0,0,0,0.65); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 4px; padding: 2px 4px; font-size: 7px; font-weight: 950; font-family: monospace; }
    .placeholder-icon { color: #27272a; }

    /* Promotional Coupon */
    .coupon-terminal { padding: 24px; background: rgba(251,191,36,0.02); border: 1px solid rgba(251,191,36,0.1); border-radius: 24px; }
    .terminal-hdr { font-size: 9px; font-weight: 950; letter-spacing: 0.2em; color: #52525b; display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .coupon-box { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
    .coupon-info { display: flex; flex-direction: column; gap: 4px; }
    .coupon-info .l { font-size: 8px; font-weight: 900; color: #52525b; text-transform: uppercase; letter-spacing: 0.1em; }
    .coupon-info .v { font-size: 11px; font-weight: 900; letter-spacing: 0.05em; }
    
    .coupon-action { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
    .code-shell { display: flex; align-items: center; background: #000; border: 1px dashed rgba(251,191,36,0.3); border-radius: 8px; padding: 4px 4px 4px 12px; }
    .code-shell .code { font-size: 12px; font-weight: 950; font-family: monospace; color: #fbbf24; letter-spacing: 0.1em; margin-right: 12px; }
    .copy-btn { width: 28px; height: 28px; background: rgba(251,191,36,0.1); color: #fbbf24; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .copy-btn:hover { background: #fbbf24; color: #000; }
    .terms { font-size: 8px; font-weight: 700; color: #3f3f46; text-transform: uppercase; }

    /* Seller Card */
    .authority-light-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 20px 28px; }
    .mini-signature { width: 48px; height: 48px; background: #000; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 950; color: #fff; }
    .auth-tag { font-size: 8px; font-weight: 950; color: #fbbf24; letter-spacing: 0.1em; }
    .id-tag { font-size: 8px; font-weight: 900; color: #3f3f46; letter-spacing: 0.1em; }
    .auth-name { font-size: 18px; font-weight: 900; color: #fff; }
    
    .inventory-node { display: flex; flex-direction: column; align-items: flex-end; padding-left: 28px; border-left: 1px solid rgba(255,255,255,0.05); }
    .inventory-node .l { font-size: 8px; font-weight: 950; color: #3f3f46; letter-spacing: 0.1em; }
    .inventory-node .v { font-size: 14px; font-weight: 950; color: #fbbf24; font-family: monospace; }

    .title { font-size: 64px; font-weight: 950; letter-spacing: -0.04em; line-height: 0.95; color: #fff; margin-bottom: 24px; }
    .description-card, .authority-light-card, .purchase-panel { width: min(100%, 760px); }
    .description-card { padding: 22px; border-radius: 22px; background: linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018)); border: 1px solid rgba(255,255,255,0.08); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 60px rgba(0,0,0,0.2); }
    .description-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 14px; }
    .description-head span { display: block; color: #fbbf24; font-size: 8px; font-weight: 950; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 7px; }
    .description-head strong { display: block; color: #fff; font-size: 17px; font-weight: 950; line-height: 1.15; }
    .description-head lucide-icon { color: #fbbf24; flex: none; }
    .description-card p { color: #a1a1aa; font-size: 15px; font-weight: 650; line-height: 1.75; }
    .description-points { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 18px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); }
    .description-points div { min-height: 42px; display: flex; align-items: center; gap: 8px; padding: 0 10px; border-radius: 12px; background: rgba(0,0,0,0.24); border: 1px solid rgba(255,255,255,0.055); }
    .description-points lucide-icon { color: #fbbf24; flex: none; }
    .description-points span { color: #d4d4d8; font-size: 9px; font-weight: 950; letter-spacing: 0.1em; text-transform: uppercase; }
    
    .tag-gold { padding: 6px 12px; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.2); color: #fbbf24; border-radius: 6px; font-size: 9px; font-weight: 950; letter-spacing: 0.15em; }
    .tag-red { padding: 6px 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 6px; font-size: 9px; font-weight: 950; letter-spacing: 0.15em; }
    .tag-zinc { padding: 6px 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #52525b; border-radius: 6px; font-size: 9px; font-weight: 950; letter-spacing: 0.15em; }
    .product-info-strip { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 24px; }
    .product-tags { display: flex; flex-wrap: wrap; gap: 12px; }
    .product-quick-facts { display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 12px; flex: none; color: #71717a; font-size: 9px; font-weight: 950; letter-spacing: 0.13em; text-transform: uppercase; }
    .product-quick-facts strong { color: #e4e4e7; font-size: 9px; font-weight: 950; }
    .product-quick-facts strong.out { color: #ef4444; }

    .feature-node { display: flex; align-items: center; gap: 16px; }
    .icon-box { width: 40px; height: 40px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #a1a1aa; }
    .node-info { display: flex; flex-direction: column; gap: 4px; }
    .node-info .k { font-size: 9px; font-weight: 900; color: #3f3f46; text-transform: uppercase; letter-spacing: 0.1em; }
    .node-info .v { font-size: 15px; font-weight: 800; color: #e4e4e7; }

    /* Checkout Panel */
    .purchase-panel { background: linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018)); border: 1px solid rgba(255,255,255,0.09); border-radius: 24px; overflow: hidden; backdrop-filter: blur(20px); box-shadow: 0 24px 80px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08); }
    .terminal-hdr { background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px 32px; font-size: 9px; font-weight: 950; letter-spacing: 0.15em; color: #a1a1aa; display: flex; align-items: center; }
    .purchase-body { padding: 26px; }
    .purchase-topline { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 18px; }
    .price-label { display: block; color: #71717a; font-size: 9px; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 8px; }
    .price-row { display: flex; align-items: end; gap: 10px; }
    .price-row strong { color: #fff; font-size: clamp(32px, 4vw, 46px); line-height: 0.9; font-family: monospace; font-weight: 950; letter-spacing: -0.03em; }
    .price-row em { color: #fbbf24; font-size: 10px; font-style: normal; font-weight: 950; letter-spacing: 0.18em; margin-bottom: 4px; }
    .price-breakdown { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 18px; }
    .price-breakdown div { min-height: 62px; padding: 12px; border-radius: 15px; background: rgba(0,0,0,0.28); border: 1px solid rgba(255,255,255,0.06); }
    .price-breakdown span { display: block; color: #71717a; font-size: 8px; font-weight: 950; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 7px; }
    .price-breakdown strong { color: #f4f4f5; font-family: monospace; font-size: 12px; font-weight: 950; }
    .price-breakdown .promo span, .price-breakdown .promo strong { color: #fbbf24; }
    .quantity-control { display: flex; align-items: center; gap: 18px; background: rgba(0,0,0,0.4); padding: 8px 18px; border: 1px solid rgba(255,255,255,0.07); border-radius: 999px; }
    .step-btn { width: 30px; height: 30px; font-size: 18px; font-weight: 500; color: #71717a; transition: 0.3s; }
    .step-btn:hover:not(:disabled) { color: #fbbf24; }
    .step-val { font-size: 18px; font-weight: 950; font-family: monospace; color: #fff; min-width: 24px; text-align: center; }

    .purchase-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .acquire-btn { position: relative; width: auto; min-width: 218px; height: 52px; padding: 0 22px; background: #fff; color: #000; border-radius: 999px; font-size: 10px; font-weight: 950; letter-spacing: 0.12em; text-transform: uppercase; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease; border: 1px solid rgba(255,255,255,0.12); cursor: pointer; }
    .acquire-btn:hover:not(:disabled) { background: #fbbf24; color: #050506; }
    .acquire-btn:active:not(:disabled) { transform: translateY(0); }
    .acquire-btn:disabled { opacity: 0.2; cursor: not-allowed; }
    .purchase-note { color: #71717a; font-size: 10px; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }

    /* Flagship Footer */
    .node-footer { width: 100%; margin-top: 34px; padding: 18px 2px 18px; border-top: 1px solid rgba(255,255,255,0.06); }
    .node-footer > div { width: 100%; }
    .footer-brand { color: #fbbf24; font-size: 10px; font-weight: 950; letter-spacing: 0.22em; text-transform: uppercase; }
    .footer-meta { color: #71717a; font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; text-align: right; }

    @media (max-width: 1200px) {
      .main-matrix { grid-template-columns: 1fr; gap: 60px; }
    }
    @media (max-width: 760px) {
      .product-detail-shell { padding: 76px 18px 0; }
      .product-info-strip { flex-direction: column; }
      .product-quick-facts { width: 100%; justify-content: flex-start; }
      .description-points { grid-template-columns: 1fr; }
      .node-footer > div { flex-direction: column; align-items: flex-start; gap: 20px; }
      .footer-meta { text-align: left; }
    }
  `]
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  currentYear = new Date().getFullYear();

  isLoading = signal(true);
  product = signal<Produit | null>(null);
  quantity = signal<number>(1);
  selectedImageIndex = signal(0);
  clientGateVisible = signal(false);

  copied = signal(false);

  // Computed signals for dynamic pricing based on quantity
  totalRebate = computed(() => {
    const p = this.product();
    const q = this.quantity();
    if (!p?.promo) return 0;
    return (p.prix * q) * (p.promo / 100);
  });

  totalFinalPrice = computed(() => {
    const p = this.product();
    const q = this.quantity();
    if (!p) return 0;
    const unitPrice = p.promo ? p.prix * (1 - p.promo / 100) : p.prix;
    return unitPrice * q;
  });

  // Determinisitc vendor stats based on their ID/Name
  vendorStats = computed(() => {
    const v = this.product()?.vendeur;
    if (!v) return { rating: '0.0', deployments: '0', fulfillment: 'Standard', tier: 'Partner' };
    
    const seed = v.id || 0;
    const rating = (4.5 + (seed % 5) / 10).toFixed(1);
    const deployments = (seed * 123 + 1000).toLocaleString();
    const fulfillment = seed % 2 === 0 ? 'Express_24h' : 'Stable_48h';
    const tier = seed % 3 === 0 ? 'Elite_Nexus' : 'Certified_Partner';

    return { rating, deployments, fulfillment, tier };
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(+id);
    } else {
      this.isLoading.set(false);
    }
  }

  loadProduct(id: number) {
    this.isLoading.set(true);
    this.productService.getProduct(id).pipe(delay(800)).subscribe({
      next: (found) => {
        this.product.set(found);
        this.quantity.set(1);
        this.selectedImageIndex.set(0);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  fitScore(): number {
    const p = this.product();
    if (!p) return 0;
    return Math.min(99.8, 88 + (Math.random() * 11.8));
  }

  mathRandom(): number {
    return Math.random();
  }

  updateQuantity(delta: number) {
    const current = this.quantity();
    const max = this.product()?.stock || 0;
    const next = current + delta;
    if (next >= 1 && next <= max) {
      this.quantity.set(next);
    }
  }

  fallbackDescription(): string {
    return `Produit sélectionné par ISGAARTI avec disponibilité vendeur, prix transparent et ajout rapide au panier pour une expérience ecommerce fluide.`;
  }

  galleryImages(): string[] {
    const p = this.product();
    if (!p) return [];
    const raw = p.images;
    if (!raw) return p.image ? [p.image] : [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return Array.from(new Set([p.image, ...parsed].filter((item): item is string => typeof item === 'string' && !!item)));
      }
    } catch {
      return p.image ? [p.image] : [];
    }

    return p.image ? [p.image] : [];
  }

  selectedImage(): string {
    const images = this.galleryImages();
    return images[this.selectedImageIndex()] || images[0] || '';
  }

  addToCart() {
    const p = this.product();
    const q = this.quantity();
    if (!p || p.stock === 0) return;

    if (!this.canUseCart()) {
      this.showClientGate();
      return;
    }

    for (let i = 0; i < q; i++) {
      this.cartService.addToCart(p);
    }
  }

  private canUseCart(): boolean {
    return this.authService.isAuthenticated() && this.authService.hasRole('ROLE_CLIENT');
  }

  private showClientGate() {
    this.clientGateVisible.set(true);
    setTimeout(() => {
      this.clientGateVisible.set(false);
      this.router.navigate(['/login']);
    }, 3000);
  }

  copyCode() {
    const p = this.product();
    if (!p?.promo) return;
    const code = p.promoCode || p.promoName || '';
    if (!code) return;
    navigator.clipboard.writeText(code);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
