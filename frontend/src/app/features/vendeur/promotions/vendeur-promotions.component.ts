import { Component, OnInit, signal, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { VendeurService } from '../../../core/services/vendeur.service';
import { Produit } from '../../../core/services/product.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { VendeurBackgroundComponent } from '../../../shared/components/vendeur-background/vendeur-background.component';
import { NexusNotificationService } from '../../../core/services/nexus-notification.service';

@Component({
  selector: 'app-vendeur-promotions',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, VendeurBackgroundComponent],
  providers: [DatePipe, CurrencyPipe],
  template: `
    <div class="bg-glow"></div>
    <div class="bg-grid"></div>
    <app-vendeur-background></app-vendeur-background>

    <div class="relative z-10 max-w-[1700px] mx-auto px-[4%] pt-20 pb-32">
      
      <!-- Flagship Hero Section -->
      <div class="relative mb-24">
        <h1 class="text-[10rem] md:text-[14rem] font-black tracking-tighter text-white/[0.02] absolute -top-32 -left-12 select-none pointer-events-none uppercase">
          Promotions
        </h1>
        
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-10 relative z-10">
          <div>
            <div class="flex items-center gap-4 mb-4">
               <span class="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] rounded">Dynamic_Pricing</span>
               <div class="h-[1px] w-12 bg-zinc-800"></div>
            </div>
            <h2 class="text-7xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
              Gouvernance <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-200">Promotionnelle</span>
            </h2>
            <p class="text-zinc-500 font-bold tracking-[0.2em] text-[10px] uppercase flex items-center gap-3">
              <lucide-icon name="tags" class="w-4 h-4 text-amber-500"></lucide-icon>
              Protocoles de Tarification et Flash-Sales
            </p>
          </div>
        </div>
      </div>

      <!-- Flagship Strategy Cards (High-Density) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div class="flagship-card overflow-hidden">
           <lucide-icon name="zap" class="absolute -right-4 -bottom-4 w-24 h-24 text-white/[0.02] -rotate-12 pointer-events-none"></lucide-icon>
           <div class="relative z-10">
              <div class="flex justify-between items-start mb-6">
                 <div class="w-10 h-10 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center shadow-xl">
                    <lucide-icon name="zap" class="w-5 h-5 text-amber-500"></lucide-icon>
                 </div>
                 <div class="px-2 py-1 bg-zinc-900 border border-white/5 rounded text-[7px] font-black text-zinc-500 uppercase tracking-widest">
                    {{ activeCampaignsCount() }} LIVE / {{ pausedCampaignsCount() }} HALT
                 </div>
              </div>
              <p class="text-[8px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-1">Campagnes Actives</p>
              <h3 class="text-2xl font-black text-white font-mono tracking-tighter">{{ myProductsWithPromo().length }}</h3>
           </div>
        </div>
        <div class="flagship-card overflow-hidden">
           <lucide-icon name="trending-up" class="absolute -right-4 -bottom-4 w-24 h-24 text-white/[0.02] -rotate-12 pointer-events-none"></lucide-icon>
           <div class="relative z-10">
              <div class="flex justify-between items-start mb-6">
                 <div class="w-10 h-10 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center shadow-xl">
                    <lucide-icon name="trending-up" class="w-5 h-5 text-amber-500"></lucide-icon>
                 </div>
              </div>
              <p class="text-[8px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-1">Drop Intensity</p>
              <h3 class="text-2xl font-black text-white font-mono tracking-tighter">{{ avgDiscount() }}% <small class="text-[10px] text-zinc-500 font-bold uppercase ml-1">AVG</small></h3>
           </div>
        </div>
        <div class="flagship-card overflow-hidden">
           <lucide-icon name="clock" class="absolute -right-4 -bottom-4 w-24 h-24 text-white/[0.02] -rotate-12 pointer-events-none"></lucide-icon>
           <div class="relative z-10">
              <div class="flex justify-between items-start mb-6">
                 <div class="w-10 h-10 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center shadow-xl">
                    <lucide-icon name="clock" class="w-5 h-5 text-amber-500"></lucide-icon>
                 </div>
                 <div *ngIf="expiringSoonCount() > 0" class="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[7px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                    URGENT: {{ expiringSoonCount() }}
                 </div>
              </div>
              <p class="text-[8px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-1">Cycle de Vie</p>
              <h3 class="text-2xl font-black text-white font-mono tracking-tighter uppercase italic">{{ expiringSoonCount() > 0 ? 'Termination' : 'Optimisé' }}</h3>
           </div>
        </div>
      </div>

      <!-- Active Strategies Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Strategy Controls + Deployment Panel -->
        <aside class="lg:col-span-4 campaign-forge-sidebar">
           <!-- STRATEGY DEPLOYMENT PANEL -->
           <div class="campaign-forge-panel">
              <div class="absolute inset-0 bg-gradient-to-b from-amber-500/[0.03] to-transparent pointer-events-none"></div>
              <lucide-icon name="orbit" class="absolute -right-8 -top-8 w-36 h-36 text-amber-500/[0.025] rotate-12 pointer-events-none"></lucide-icon>
              
              <div class="p-7 border-b border-white/5 bg-white/[0.01] relative z-10">
                 <div class="flex justify-between items-start mb-6">
                    <div>
                       <div class="flex items-center gap-2 mb-2">
                          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          <span class="text-[8px] font-black text-zinc-500 uppercase tracking-[0.4em]">Campaign_Forge</span>
                       </div>
                       <h3 class="text-2xl font-black text-white tracking-tighter uppercase leading-none">Flash-Sale Launchpad</h3>
                    </div>
                    <div class="launch-score">
                       <span>{{ promoData.pourcentage || 0 }}%</span>
                       <small>Drop</small>
                    </div>
                 </div>

                  <div class="impact-forecast">
                    <div class="forecast-node">
                       <lucide-icon name="trending-up" class="w-4 h-4"></lucide-icon>
                       <span class="node-sub">Projected Lift</span>
                       <strong class="node-main">+{{ projectedLift() }}%</strong>
                    </div>
                    <div class="forecast-node">
                       <lucide-icon name="shield-alert" class="w-4 h-4"></lucide-icon>
                       <span class="node-sub">Margin Guard</span>
                       <strong class="node-main">{{ marginGuard() }}</strong>
                    </div>
                    <div class="forecast-node">
                       <lucide-icon name="timer-reset" class="w-4 h-4"></lucide-icon>
                       <span class="node-sub">Auto End</span>
                       <strong class="node-main">Armed</strong>
                    </div>
                  </div>
               </div>

               <div class="p-7 space-y-6 relative z-10">
                  <div class="campaign-word-console group/input">
                    <div class="flex justify-between items-center mb-4">
                       <label class="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Campaign Word</label>
                       <div class="flex items-center gap-1.5">
                          <span class="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>
                          <span class="text-[7px] font-black text-amber-500/50 uppercase tracking-widest">Live_Generator</span>
                       </div>
                    </div>
                    <div class="campaign-word-shell">
                       <div class="terminal-header">
                          <span class="terminal-dot"></span>
                          <span class="terminal-title">AUTH_SECURE_LINK</span>
                       </div>
                       <lucide-icon name="sparkles" class="word-leading-icon w-4 h-4"></lucide-icon>
                       <input type="text" [(ngModel)]="campaignWord" class="terminal-input-field" placeholder="DECRYPTION_CODE...">
                       <button (click)="generateCampaignWord()" class="terminal-sync-btn" title="Sync neural seed">
                          <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
                       </button>
                       <div class="terminal-footer">
                          <div class="footer-line"></div>
                       </div>
                    </div>
                    <div class="campaign-preview-strip-v2 group">
                       <div class="strip-label">DECRYPTION_CODE</div>
                       <input type="text" [(ngModel)]="campaignWord" class="strip-value-input" placeholder="DEFINE_CODE...">
                       <div class="strip-flicker-overlay"></div>
                    </div>
                 </div>

                 <div>
                    <label class="block text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Products in Campaign</label>
                    <div class="selected-products-console">
                        <button (click)="isProductSelectorOpen.set(true)" class="arsenal-gate-trigger group">
                          <div class="gate-biometric">
                            <lucide-icon name="fingerprint" class="w-5 h-5"></lucide-icon>
                            <div class="scan-line-v"></div>
                          </div>
                          <div class="gate-intel">
                            <span class="intel-sub">{{ selectedProductIds().length ? 'SYSTEMS_ARMED' : 'GATE_LOCKED' }}</span>
                            <span class="intel-main">{{ selectedProductsLabel() }}</span>
                          </div>
                          <div class="gate-status-orb" [class.active]="selectedProductIds().length > 0"></div>
                        </button>
                    </div> 

                    @if (selectedProducts().length) {
                      <div class="target-manifest-stack flagship-scrollbar">
                        @for (p of selectedProducts(); track p.id; let i = $index) {
                          <div class="campaign-target-card group/node">
                            <div class="target-index-rail">
                              <span>{{ (i + 1).toString().padStart(2, '0') }}</span>
                            </div>
                            <div class="target-media-capsule">
                              <img *ngIf="p.image" [src]="p.image" [alt]="p.nom">
                              <lucide-icon *ngIf="!p.image" name="package" class="w-4 h-4 text-zinc-700"></lucide-icon>
                            </div>
                            <div class="target-manifest-copy">
                              <span>LOCKED_TARGET</span>
                              <strong>{{ p.nom }}</strong>
                            </div>
                            <div class="target-payload">
                              <span>-{{ promoData.pourcentage }}%</span>
                              <small>DROP</small>
                            </div>
                            <button (click)="toggleProduct(p.id!)" class="target-eject-btn" title="Remove product">
                              <lucide-icon name="x" class="w-3 h-3"></lucide-icon>
                            </button>
                          </div>
                        }
                      </div>
                    } @else {
                      <div class="forge-empty-state">
                        <div class="empty-orb"></div>
                        <span>Awaiting Node Authorization...</span>
                      </div>
                    }
                 </div>

                 <div class="discount-console">
                    <div class="tactical-gauge-v2">
                       <div class="gauge-header">
                          <label class="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Drop Intensity</label>
                          <span class="gauge-val">{{ promoData.pourcentage }}%</span>
                       </div>
                       <div class="relative pt-4">
                          <div class="kinetic-wave-container">
                             <div class="kinetic-wave" [style.transform]="'scaleY(' + (1 + promoData.pourcentage/100) + ')'"></div>
                             <div class="gauge-fill-v2" [style.width.%]="promoData.pourcentage"></div>
                          </div>
                          <input type="range" min="0" max="80" [(ngModel)]="promoData.pourcentage" class="tactical-range">
                       </div>
                    </div>
                    <div class="tactical-date-v2">
                       <div class="flex justify-between items-center mb-4">
                          <label class="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Temporal_Lock</label>
                          <div class="temporal-status">
                             <div class="status-dot"></div>
                             <span>SYNCED</span>
                          </div>
                       </div>
                       <div class="temporal-clock-hud" [class.empty]="!promoData.dateFin">
                          <lucide-icon name="clock" class="w-4 h-4 text-amber-500/30"></lucide-icon>
                          <input type="datetime-local" [(ngModel)]="promoData.dateFin" class="temporal-input">
                          <div class="clock-markers">
                             <span></span><span></span><span></span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <!-- Removed Traces -->


                 <button (click)="applyPromo()" class="tactical-launch-btn">
                    <div class="btn-command-layout">
                       <div class="btn-icon">
                          <lucide-icon name="shield-check" class="w-4 h-4"></lucide-icon>
                       </div>
                       <div class="btn-command-copy">
                          <span>Execute Protocol</span>
                          <small>{{ selectedProductIds().length ? 'Ready for deployment' : 'Select campaign targets' }}</small>
                       </div>
                       <div class="btn-node-pill">
                          <strong>{{ selectedProductIds().length }}</strong>
                          <span>Nodes</span>
                       </div>
                    </div>
                    <div class="btn-status-bar">
                       <div class="status-fill" [style.width.%]="selectedProductIds().length > 0 ? 100 : 0"></div>
                    </div>
                 </button>
              </div>
           </div>
        </aside>

        <!-- Active Promotion Tickets -->
        <div class="lg:col-span-8 promotion-ticket-board">
          <div class="ticket-board-header">
            <div>
              <p>Live Promo Tickets</p>
              <h3>Campaign Tickets</h3>
            </div>
            <div class="ticket-board-count">
              <span>{{ myProductsWithPromo().length }}</span>
              <small>Active</small>
            </div>
          </div>
          @if (myProductsWithPromo().length) {
            <div class="promo-ticket-grid">
              @for (p of myProductsWithPromo(); track p.promoId || p.id) {
                <article class="promo-ticket-card" [class.paused]="!p.promoActive">

                  <!-- State Rail -->
                  <div class="ptc-state-rail" [class.on]="p.promoActive">
                    <span class="ptc-rail-dot"></span>
                    <span class="ptc-rail-label">{{ p.promoActive ? 'LIVE' : 'HALT' }}</span>
                  </div>

                  <!-- Image -->
                  <div class="ptc-media">
                    <img *ngIf="p.image" [src]="p.image" [alt]="p.nom">
                    <lucide-icon *ngIf="!p.image" name="package" class="w-7 h-7 text-zinc-700"></lucide-icon>
                    <div class="ptc-media-vignette"></div>
                    <div class="ptc-hologram-grid"></div>
                    <div class="ptc-scan-line"></div>
                    <div class="ptc-badge">-{{ p.promo }}%</div>
                  </div>

                  <!-- Content -->
                  <div class="ptc-content">
                    <!-- Top row: codename + ID -->
                    <div class="ptc-header-row">
                      <div class="ptc-codename-group">
                        <div class="ptc-codename" [class.copied]="copyingId() === p.promoId">
                          <lucide-icon name="fingerprint" class="w-3 h-3"></lucide-icon>
                          <span>{{ p.promoName || getCodename(p.nom, p.id!) }}</span>
                        </div>
                        <button (click)="copyCode(p.promoName || getCodename(p.nom, p.id!), p.promoId!)" class="ptc-copy-btn" title="Copy Promo Code">
                          <lucide-icon [name]="copyingId() === p.promoId ? 'check' : 'copy'" class="w-3 h-3"></lucide-icon>
                        </button>
                      </div>
                      <span class="ptc-node-id">NODE_{{ p.id | number:'2.0-0' }}</span>
                    </div>

                    <!-- Product Name -->
                    <h4 class="ptc-product-name">{{ p.nom }}</h4>

                    <!-- Data ledger -->
                    <div class="ptc-data-row">
                      <div class="ptc-data-cell">
                        <span>Base Rate</span>
                        <strong>{{ p.prix | currency:'EUR' }}</strong>
                      </div>
                      <div class="ptc-data-sep"></div>
                      <div class="ptc-data-cell">
                        <span>Strike Price</span>
                        <strong class="amber">{{ p.prix * (1 - (p.promo || 0) / 100) | currency:'EUR' }}</strong>
                      </div>
                      <div class="ptc-data-sep"></div>
                      <div class="ptc-data-cell">
                        <span>Termination</span>
                        <strong>{{ p.promoEnd | date:'dd MMM yy' }}</strong>
                      </div>
                    </div>

                    <!-- Enterprise Telemetry HUD (Unique Idea) -->
                    <div class="ptc-telemetry-hud">
                      <div class="ptc-pulse-group">
                        <div class="ptc-pulse-bar" *ngFor="let i of [1,2,3,4,5,6,7,8]"></div>
                      </div>
                      <div class="ptc-hash-trace">
                        <lucide-icon name="shield-check" class="w-2.5 h-2.5 mr-1"></lucide-icon>
                        <span>SIG://{{ getDeploymentHash(p.id!) }}</span>
                      </div>
                      <div class="ptc-stream-status">
                        <span class="ptc-blink-dot"></span>
                        STABLE_LINK
                      </div>
                    </div>
                  </div>

                  <!-- Action Column -->
                  <div class="ptc-action-col">
                    <!-- Toggle -->
                    <div class="ptc-toggle-wrapper">
                      <span class="ptc-toggle-label">{{ p.promoActive ? 'ACTIVE' : 'PAUSED' }}</span>
                      <button
                        class="ptc-toggle"
                        [class.on]="p.promoActive"
                        (click)="togglePromo(p)"
                        [title]="p.promoActive ? 'Pause campaign' : 'Activate campaign'"
                      >
                        <span class="ptc-toggle-glow"></span>
                        <span class="ptc-thumb"></span>
                      </button>
                    </div>
                    <!-- Delete -->
                    <button
                      class="ptc-erase-btn"
                      (click)="triggerDeleteConfirm(p.promoId!, p.nom, $event)"
                      [class.armed]="pendingDeleteAction()?.id === p.promoId"
                      title="Terminate protocol"
                    >
                      <lucide-icon name="trash-2" class="w-3.5 h-3.5"></lucide-icon>
                    </button>
                  </div>

                </article>
              }
            </div>
          } @else {

            <div class="ticket-empty-state">
              <lucide-icon name="ticket-percent" class="w-12 h-12"></lucide-icon>
              <h3>No Active Promo Tickets</h3>
              <p>Launch a campaign from the forge panel to generate live promotion tickets.</p>
            </div>
          }
        </div>

      </div>
    </div>

    <!-- Flagship Neural Action Link (Filament & Orb) -->
    @if (pendingDeleteAction(); as action) {
      <!-- Electric Filament -->
      <svg class="fixed inset-0 z-[990] pointer-events-none w-full h-full">
        <defs>
          <linearGradient id="electricGradientPromoTicket" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ef4444" stop-opacity="0" />
            <stop offset="50%" stop-color="#ef4444" stop-opacity="0.8">
              <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stop-color="#ef4444" stop-opacity="0" />
          </linearGradient>
          <filter id="glowPromoTicket">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path [attr.d]="filamentPath()" fill="none" stroke="url(#electricGradientPromoTicket)" stroke-width="3" filter="url(#glowPromoTicket)" class="animate-filament" />
        <circle [attr.cx]="deleteBtnPos().x" [attr.cy]="deleteBtnPos().y" r="4" fill="#ef4444" class="animate-ping" />
      </svg>

      <div class="fixed z-[1000] w-[260px] animate-in fade-in zoom-in-95 slide-in-from-right-10 duration-500" [style.left.px]="alertLeft()" [style.top.px]="alertTop()">
        <div class="bg-zinc-950/95 backdrop-blur-3xl border border-red-500/30 rounded-[1.5rem] p-5 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent opacity-60"></div>
          <div class="absolute top-0 left-0 w-full h-[2px] bg-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.5)]"><div class="h-full bg-red-400 animate-scan"></div></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]"><lucide-icon name="shield-alert" class="w-5 h-5"></lucide-icon></div>
              <div class="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center gap-1"><div class="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div><span class="text-[7px] font-black text-red-500 uppercase tracking-[0.15em]">Secure</span></div>
            </div>
            <div class="mb-4">
              <h4 class="text-[7px] font-black text-zinc-500 uppercase tracking-[0.25em] mb-1">Suppression</h4>
              <h2 class="text-lg font-black text-white uppercase tracking-tighter leading-tight mb-1">Détruire <span class="text-red-500 italic">"{{ action.name }}"</span> ?</h2>
              <p class="text-[9px] font-bold text-zinc-400 leading-tight">Action irréversible. Le ticket promotionnel sera réinitialisé.</p>
            </div>
            <div class="flex flex-col gap-2">
              <button (click)="executeDelete(action.id)" class="w-full h-11 rounded-xl bg-red-600 text-black text-[10px] font-black uppercase tracking-[0.15em] shadow-[0_12px_25px_rgba(239,68,68,0.2)] hover:bg-red-500 transition-all flex items-center justify-center gap-2"><lucide-icon name="trash-2" class="w-3.5 h-3.5"></lucide-icon>Confirmer</button>
              <button (click)="pendingDeleteAction.set(null)" class="w-full h-11 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:bg-white/10 transition-all">Annuler</button>
            </div>
            <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between opacity-50">
              <div class="text-[6px] font-black text-zinc-600 uppercase tracking-widest">ID: {{ action.id }}</div>
              <div class="text-[6px] font-black text-zinc-600 uppercase tracking-widest italic">{{ Date.now() | date:'HH:mm:ss' }}</div>
            </div>
          </div>
        </div>
      </div>
    }

    <div class="product-selector-scrim" [class.active]="isProductSelectorOpen()" (click)="isProductSelectorOpen.set(false)"></div>
    <aside class="product-selector-window" [class.active]="isProductSelectorOpen()">
      <div class="selector-blueprint-overlay"></div>

      <div class="selector-window-header">
        <div class="header-main">
          <div class="enterprise-badge">
             <div class="badge-ring"></div>
             <span>TARGET_DECK</span>
          </div>
          <h3 class="selector-title">Promotion Target Deck</h3>
          <div class="selector-stats-hud">
             <div class="hud-item">
                <small>Catalog</small>
                <span>{{ products().length }}</span>
             </div>
             <div class="hud-divider"></div>
             <div class="hud-item active">
                <small>Selected</small>
                <span>{{ selectedProductIds().length }}</span>
             </div>
             <div class="hud-divider"></div>
             <div class="hud-item">
                <small>Discount</small>
                <span>{{ promoData.pourcentage || 0 }}%</span>
             </div>
          </div>
        </div>
        <button (click)="isProductSelectorOpen.set(false)" class="flagship-close-btn">
          <lucide-icon name="pin" class="w-5 h-5"></lucide-icon>
        </button>
      </div>

      <div class="selector-control-center">
        <div class="matrix-search">
           <lucide-icon name="search" class="w-4 h-4 text-amber-500/50"></lucide-icon>
           <input type="text" placeholder="FILTER PRODUCTS..." class="matrix-search-input">
           <div class="scan-glow"></div>
        </div>
        <div class="matrix-actions">
           <button (click)="selectAllProducts()" class="matrix-btn primary">
              <lucide-icon name="list-checks" class="w-4 h-4"></lucide-icon>
              {{ selectedProductIds().length === products().length ? 'Clear All' : 'Select All' }}
           </button>
        </div>
      </div>

      <div class="target-deck-summary">
        <div>
          <lucide-icon name="ticket-percent" class="w-4 h-4"></lucide-icon>
          <span>Campaign</span>
          <strong>{{ campaignWord || 'UNNAMED' }}</strong>
        </div>
        <div>
          <lucide-icon name="shield-check" class="w-4 h-4"></lucide-icon>
          <span>Margin Guard</span>
          <strong>{{ marginGuard() }}</strong>
        </div>
      </div>

      <div class="selector-products-grid flagship-scrollbar">
        @for (p of products(); track p.id) {
          <button class="deck-product-card" [class.selected]="isProductSelected(p.id!)" (click)="toggleProduct(p.id!)">
             <div class="deck-product-media">
                <img *ngIf="p.image" [src]="p.image" [alt]="p.nom">
                <div *ngIf="!p.image" class="deck-placeholder">
                   <lucide-icon name="package" class="w-6 h-6"></lucide-icon>
                </div>
                <span class="deck-discount">-{{ promoData.pourcentage || 0 }}%</span>
             </div>

             <div class="deck-product-copy">
                <span>{{ p.categorie?.nom || 'General' }}</span>
                <h4>{{ p.nom }}</h4>
                <div class="deck-price-row">
                   <strong>{{ p.prix | currency:'EUR' }}</strong>
                   <lucide-icon name="arrow-right" class="w-3.5 h-3.5"></lucide-icon>
                   <strong class="target">{{ p.prix * (1 - (promoData.pourcentage || 0)/100) | currency:'EUR' }}</strong>
                </div>
             </div>

             <div class="deck-select-indicator">
                <lucide-icon [name]="isProductSelected(p.id!) ? 'check' : 'plus'" class="w-4 h-4"></lucide-icon>
             </div>
          </button>
        }
      </div>

      <div class="selector-footer-actions">
        <button (click)="isProductSelectorOpen.set(false)">
          <lucide-icon name="pin" class="w-4 h-4"></lucide-icon>
          Pin Selection
        </button>
      </div>
    </aside>

    <style>
      .flagship-card { background: rgba(15, 15, 18, 0.85); backdrop-filter: blur(60px); border: 1px solid rgba(255, 255, 255, 0.06); padding: 24px; border-radius: 16px; position: relative; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      .flagship-card:hover { transform: translateY(-4px); border-color: rgba(251, 191, 36, 0.2); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }

      .enterprise-table { width: 100%; border-collapse: separate; border-spacing: 0; }
      .enterprise-table th { padding: 20px 32px; text-align: left; text-transform: uppercase; letter-spacing: 0.3em; font-size: 8px; font-weight: 900; color: #52525b; border-bottom: 1px solid rgba(255,255,255,0.03); }
      .enterprise-table td { padding: 12px 32px; font-size: 0.875rem; vertical-align: middle; }

      .promotion-ticket-board { position: relative; overflow: hidden; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); background: linear-gradient(180deg, rgba(15,15,18,0.92), rgba(5,5,7,0.98)); box-shadow: 0 34px 90px rgba(0,0,0,0.48); }
      .promotion-ticket-board::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 12% 10%, rgba(251,191,36,0.08), transparent 34%); pointer-events: none; }
      .promotion-ticket-board > * { position: relative; z-index: 1; }
      .ticket-board-header { display: flex; justify-content: space-between; align-items: flex-end; padding: 24px; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.015); }
      .ticket-board-header p { color: #fbbf24; font-size: 8px; font-weight: 900; letter-spacing: 0.36em; text-transform: uppercase; margin-bottom: 8px; }
      .ticket-board-header h3 { color: white; font-size: 34px; line-height: 1; font-weight: 900; letter-spacing: -0.04em; text-transform: uppercase; }
      .ticket-board-count { width: 74px; height: 62px; border-radius: 10px; border: 1px solid rgba(251,191,36,0.18); background: rgba(251,191,36,0.06); display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .ticket-board-count span { color: #fbbf24; font-size: 20px; font-weight: 900; font-family: monospace; line-height: 1; }
      .ticket-board-count small { color: #71717a; font-size: 7px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase; margin-top: 6px; }
      .ticket-empty-state { min-height: 520px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 32px; color: #fbbf24; }
      .ticket-empty-state h3 { margin-top: 18px; color: white; font-size: 22px; font-weight: 900; letter-spacing: -0.02em; }
      .ticket-empty-state p { margin-top: 8px; color: #71717a; max-width: 360px; font-size: 13px; font-weight: 700; }

      .campaign-forge-sidebar { position: sticky; top: 76px; align-self: start; }
      .campaign-forge-panel { position: relative; overflow: hidden; border-radius: 24px; border: 1px solid rgba(251,191,36,0.1); background: rgba(10, 10, 12, 0.85); backdrop-filter: blur(40px); box-shadow: 0 40px 100px rgba(0,0,0,0.6); }
      
      .impact-forecast { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .forecast-node { padding: 12px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; display: flex; flex-direction: column; gap: 4px; color: #fbbf24; }
      .node-sub { font-size: 7px; font-weight: 900; color: #3f3f46; text-transform: uppercase; letter-spacing: 0.1em; }
      .node-main { font-size: 11px; font-weight: 900; color: white; font-family: monospace; }
      
      .launch-score { position: relative; width: 72px; height: 72px; border-radius: 16px; border: 1px solid rgba(251,191,36,0.2); background: rgba(251,191,36,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; }
      .launch-score::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%); animation: core-pulse 3s infinite; }
      @keyframes core-pulse { 0% { transform: scale(0.8); opacity: 0.3; } 50% { transform: scale(1.2); opacity: 0.6; } 100% { transform: scale(0.8); opacity: 0.3; } }
      .launch-score span { position: relative; color: #fbbf24; font-size: 20px; font-weight: 900; font-family: monospace; z-index: 1; }
      .launch-score small { position: relative; color: #71717a; font-size: 7px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 4px; z-index: 1; }

      .arsenal-gate-trigger { width: 100%; height: 64px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; padding: 0 16px; gap: 16px; transition: 0.3s; position: relative; overflow: hidden; }
      .arsenal-gate-trigger:hover { border-color: #fbbf24; background: rgba(251,191,36,0.05); }
      .gate-biometric { width: 44px; height: 44px; border-radius: 10px; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.2); display: flex; align-items: center; justify-content: center; color: #fbbf24; position: relative; overflow: hidden; }
      .scan-line-v { position: absolute; left: 0; width: 100%; height: 1px; background: #fbbf24; box-shadow: 0 0 10px #fbbf24; animation: scan-v 2s linear infinite; }
      @keyframes scan-v { 0% { top: 0; } 100% { top: 100%; } }
      .gate-intel { flex: 1; display: flex; flex-direction: column; text-align: left; }
      .intel-sub { font-size: 7px; font-weight: 900; color: #3f3f46; text-transform: uppercase; letter-spacing: 0.2em; }
      .intel-main { font-size: 11px; font-weight: 900; color: white; text-transform: uppercase; letter-spacing: -0.01em; }
      .gate-status-orb { width: 8px; height: 8px; border-radius: 999px; background: #18181b; border: 1px solid rgba(255,255,255,0.1); }
      .gate-status-orb.active { background: #fbbf24; box-shadow: 0 0 15px #fbbf24; }

      .target-manifest-stack { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; max-height: 238px; overflow-y: auto; padding: 2px 2px 2px 0; }
      .campaign-target-card { position: relative; min-height: 62px; display: grid; grid-template-columns: 28px 48px minmax(0, 1fr) auto 28px; align-items: center; gap: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.07); background: linear-gradient(90deg, rgba(255,255,255,0.035), rgba(251,191,36,0.035), rgba(0,0,0,0.22)); padding: 8px; overflow: hidden; transition: 0.24s cubic-bezier(0.16, 1, 0.3, 1); }
      .campaign-target-card::before { content: ''; position: absolute; left: 76px; right: 48px; top: 50%; height: 1px; background: linear-gradient(90deg, rgba(251,191,36,0.24), transparent); pointer-events: none; }
      .campaign-target-card:hover { border-color: rgba(251,191,36,0.34); background: linear-gradient(90deg, rgba(251,191,36,0.07), rgba(255,255,255,0.025), rgba(0,0,0,0.18)); transform: none; }
      .target-index-rail { height: 46px; border-radius: 8px; border: 1px solid rgba(251,191,36,0.14); background: rgba(0,0,0,0.42); display: flex; align-items: center; justify-content: center; }
      .target-index-rail span { writing-mode: vertical-rl; color: #71717a; font-size: 8px; font-weight: 900; font-family: monospace; letter-spacing: 0.1em; }
      .target-media-capsule { position: relative; width: 48px; height: 48px; border-radius: 11px; overflow: hidden; background: #050507; border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; }
      .target-media-capsule img { width: 100%; height: 100%; object-fit: cover; opacity: 0.78; }
      .target-manifest-copy { min-width: 0; position: relative; z-index: 1; }
      .target-manifest-copy span { display: block; color: #71717a; font-size: 7px; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase; }
      .target-manifest-copy strong { display: block; margin-top: 4px; color: #fff; font-size: 11px; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .target-payload { position: relative; z-index: 1; min-width: 44px; border-radius: 9px; border: 1px solid rgba(251,191,36,0.18); background: rgba(251,191,36,0.07); padding: 6px 8px; text-align: center; }
      .target-payload span { display: block; color: #fbbf24; font-size: 11px; font-weight: 900; font-family: monospace; }
      .target-payload small { display: block; margin-top: 2px; color: #71717a; font-size: 6px; font-weight: 900; letter-spacing: 0.16em; }
      .target-eject-btn { position: relative; z-index: 1; width: 28px; height: 28px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.035); color: #a1a1aa; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
      .target-eject-btn:hover { background: rgba(239,68,68,0.14); border-color: rgba(239,68,68,0.32); color: #fecaca; }

      .form-input-flagship-v2 { width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px 16px; color: #fff; font-weight: 900; letter-spacing: 0.1em; outline: none; }
      .campaign-word-shell { position: relative; display: flex; gap: 8px; }
      .temporal-status { display: flex; align-items: center; gap: 6px; }
      .status-dot { width: 4px; height: 4px; border-radius: 999px; background: #fbbf24; box-shadow: 0 0 10px #fbbf24; }
      .temporal-status span { font-size: 7px; font-weight: 900; color: #fbbf24; letter-spacing: 0.1em; }
      
      .discount-console { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; }
      .tactical-gauge-v2, .tactical-date-v2 { min-width: 0; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; background: linear-gradient(180deg, rgba(255,255,255,0.035), rgba(0,0,0,0.32)); padding: 16px; box-shadow: inset 0 0 0 1px rgba(251,191,36,0.025); }
      .gauge-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
      .gauge-val { color: #fbbf24; font-family: monospace; font-size: 16px; font-weight: 900; text-shadow: 0 0 18px rgba(251,191,36,0.24); }
      .tactical-range { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 4; }
      .temporal-clock-hud { position: relative; display: flex; align-items: center; min-height: 48px; background: linear-gradient(135deg, rgba(0,0,0,0.64), rgba(251,191,36,0.035)); border: 1px solid rgba(251,191,36,0.16); border-radius: 12px; padding: 12px 10px 12px 14px; gap: 8px; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.025); }
      .temporal-clock-hud.empty { border-color: rgba(251,191,36,0.18); background: linear-gradient(135deg, rgba(0,0,0,0.68), rgba(251,191,36,0.035)); }
      .temporal-clock-hud::after { content: ''; position: absolute; left: 10px; right: 10px; bottom: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(251,191,36,0.62), rgba(255,255,255,0.28), transparent); }
      .temporal-input { position: relative; z-index: 1; flex: 1 1 auto; min-width: 0; background: transparent; border: none; color: #fff; font-size: 10px; font-weight: 900; font-family: monospace; outline: none; width: 100%; color-scheme: dark; letter-spacing: 0; }
      .temporal-input::-webkit-datetime-edit { color: #e4e4e7; padding: 0; }
      .temporal-input::-webkit-datetime-edit-text { color: #52525b; padding: 0 2px; }
      .temporal-input::-webkit-datetime-edit-month-field,
      .temporal-input::-webkit-datetime-edit-day-field,
      .temporal-input::-webkit-datetime-edit-year-field,
      .temporal-input::-webkit-datetime-edit-hour-field,
      .temporal-input::-webkit-datetime-edit-minute-field { color: #fff; background: rgba(255,255,255,0.035); border-radius: 4px; padding: 2px 3px; }
      .clock-markers { flex: 0 0 auto; display: flex; gap: 2px; }
      .clock-markers span { width: 1px; height: 10px; background: rgba(251,191,36,0.2); }
      .terminal-input-field { width: 100%; background: rgba(0,0,0,0.6); border: 1px solid rgba(251,191,36,0.15); border-radius: 4px; padding: 18px 16px 14px 44px; color: #fbbf24; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 900; letter-spacing: 0.1em; outline: none; transition: 0.3s; text-transform: uppercase; }
      .terminal-input-field:focus { background: rgba(251,191,36,0.02); border-color: #fbbf24; box-shadow: 0 0 20px rgba(251,191,36,0.1); }
      .campaign-word-console { position: relative; padding: 16px; border-radius: 16px; border: 1px solid rgba(251,191,36,0.12); background: linear-gradient(180deg, rgba(251,191,36,0.045), rgba(0,0,0,0.18)); overflow: hidden; }
      .campaign-word-console::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(251,191,36,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.025) 1px, transparent 1px); background-size: 22px 22px; pointer-events: none; }
      .campaign-word-console > * { position: relative; z-index: 1; }
      .campaign-preview-strip-v2 { margin-top: 10px; display: grid; grid-template-columns: auto 1fr; gap: 12px; align-items: center; padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07); background: rgba(0,0,0,0.38); }
      .strip-label { color: #71717a; font-size: 7px; font-weight: 900; letter-spacing: 0.22em; text-transform: uppercase; }
      .strip-value-input { background: transparent; border: none; outline: none; color: #fbbf24; font-size: 14px; font-weight: 900; font-family: monospace; letter-spacing: 0.05em; width: 100%; text-align: right; text-transform: uppercase; }
      .strip-value-input::placeholder { color: rgba(251,191,36,0.2); }
      .terminal-header { position: absolute; top: 6px; left: 16px; display: flex; align-items: center; gap: 6px; z-index: 10; pointer-events: none; }
      .terminal-dot { width: 4px; height: 4px; background: #fbbf24; border-radius: 999px; }
      .terminal-title { font-size: 6px; font-weight: 900; color: #fbbf24; opacity: 0.5; letter-spacing: 0.1em; }
      .terminal-footer { position: absolute; bottom: 0; left: 0; width: 100%; height: 2px; overflow: hidden; pointer-events: none; }
      .footer-line { width: 100%; height: 100%; background: linear-gradient(90deg, transparent, #fbbf24, transparent); transform: translateX(-100%); animation: line-slide 3s infinite; }
      @keyframes line-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      .terminal-sync-btn { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.2); color: #fbbf24; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: 0.3s; z-index: 10; }
      .terminal-sync-btn:hover { background: #fbbf24; color: #000; transform: translateY(-50%) rotate(180deg); }
      .forge-empty-state { position: relative; min-height: 92px; margin-top: 16px; border-radius: 14px; border: 1px dashed rgba(251,191,36,0.18); background: rgba(0,0,0,0.28); display: flex; align-items: center; justify-content: center; gap: 12px; overflow: hidden; }
      .forge-empty-state::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(251,191,36,0.06), transparent); transform: translateX(-100%); animation: line-slide 4s infinite; }
      .forge-empty-state span { position: relative; z-index: 1; color: #a1a1aa; font-size: 10px; font-weight: 900; letter-spacing: 0.22em; text-transform: uppercase; }
      .empty-orb { position: relative; z-index: 1; width: 34px; height: 34px; border-radius: 10px; border: 1px solid rgba(251,191,36,0.22); background: rgba(251,191,36,0.07); box-shadow: 0 0 26px rgba(251,191,36,0.12); }
      .empty-orb::after { content: ''; position: absolute; inset: 11px; border-radius: 999px; background: #fbbf24; box-shadow: 0 0 16px rgba(251,191,36,0.7); }

      .kinetic-wave-container { position: relative; height: 42px; background: linear-gradient(180deg, rgba(34,211,238,0.035), rgba(0,0,0,0.48)); border-radius: 9px; border: 1px solid rgba(34,211,238,0.14); overflow: hidden; display: flex; align-items: center; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02); }
      .kinetic-wave-container::before { content: ''; position: absolute; left: 10px; right: 10px; top: 50%; height: 1px; background: repeating-linear-gradient(90deg, rgba(34,211,238,0.18) 0 10px, transparent 10px 16px); }
      .kinetic-wave { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(251,191,36,0.07), transparent 70%); transform-origin: bottom; transition: 0.4s; }
      .gauge-fill-v2 { height: 5px; background: linear-gradient(90deg, #22d3ee, #fbbf24 62%, #fff7ad); border-radius: 999px; position: relative; z-index: 2; margin: 0 12px; transition: 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
      .gauge-fill-v2::after { content: ''; position: absolute; right: -5px; top: 50%; width: 12px; height: 12px; border-radius: 999px; background: #fff7ad; border: 2px solid rgba(0,0,0,0.72); transform: translateY(-50%); }

      .temporal-input::-webkit-calendar-picker-indicator { filter: invert(0.8) sepia(1) saturate(5) hue-rotate(0deg); cursor: pointer; padding: 4px; border-radius: 4px; transition: 0.3s; }
      .temporal-input::-webkit-calendar-picker-indicator:hover { background: rgba(251,191,36,0.2); filter: invert(1); }

      .btn-status-bar { position: absolute; left: 14px; right: 14px; bottom: 9px; height: 3px; border-radius: 999px; background: rgba(255,255,255,0.07); overflow: hidden; }
      .status-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #fbbf24, #fef3c7); transition: 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
      .tactical-launch-btn { position: relative; width: 100%; min-height: 72px; overflow: hidden; border-radius: 12px; background: linear-gradient(180deg, rgba(24,24,27,0.96), rgba(9,9,11,0.98)); color: #fff; border: 1px solid rgba(255,255,255,0.09); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05); transition: border-color 0.18s, background 0.18s; }
      .tactical-launch-btn:hover { border-color: rgba(251,191,36,0.34); background: linear-gradient(180deg, rgba(31,31,35,0.98), rgba(10,10,12,0.98)); transform: none; box-shadow: inset 0 1px 0 rgba(255,255,255,0.06); }
      .btn-command-layout { position: relative; z-index: 1; display: grid; grid-template-columns: 42px minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 13px 14px 18px; text-align: left; }
      .btn-icon { width: 42px; height: 42px; border-radius: 10px; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.18); color: #fbbf24; display: flex; align-items: center; justify-content: center; }
      .btn-command-copy { min-width: 0; display: flex; flex-direction: column; gap: 5px; }
      .btn-command-copy span { color: #fafafa; font-size: 12px; line-height: 1; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; }
      .btn-command-copy small { color: #71717a; font-size: 9px; line-height: 1; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .btn-node-pill { min-width: 68px; height: 34px; border-radius: 999px; border: 1px solid rgba(251,191,36,0.18); background: rgba(251,191,36,0.07); display: flex; align-items: center; justify-content: center; gap: 6px; color: #fbbf24; }
      .btn-node-pill strong { font-size: 13px; font-weight: 900; font-family: monospace; line-height: 1; }
      .btn-node-pill span { color: #a1a1aa; font-size: 7px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; }

      .product-selector-window { position: fixed; z-index: 9001; left: 0; top: 0; bottom: 0; width: min(640px, 94vw); background: #050507; border-right: 1px solid rgba(251,191,36,0.1); box-shadow: 40px 0 120px rgba(0,0,0,0.9); transform: translateX(-105%); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); padding: 40px; display: flex; flex-direction: column; gap: 40px; overflow: hidden; }
      .product-selector-window.active { transform: translateX(0); }
      .selector-blueprint-overlay { position: absolute; inset: 0; background-image: radial-gradient(rgba(251,191,36,0.03) 1px, transparent 0); background-size: 32px 32px; pointer-events: none; opacity: 0.5; }
      
      .enterprise-badge { display: inline-flex; align-items: center; gap: 10px; padding: 6px 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 999px; }
      .badge-ring { width: 6px; height: 6px; border: 1px solid #fbbf24; border-radius: 999px; }
      .enterprise-badge span { color: #71717a; font-size: 7px; font-weight: 900; letter-spacing: 0.3em; }
      
      .selector-title { color: #fff; font-size: 42px; font-weight: 900; letter-spacing: -0.04em; line-height: 0.9; margin: 12px 0 24px; }
      .selector-stats-hud { display: flex; align-items: center; gap: 32px; }
      .hud-item small { display: block; font-size: 7px; font-weight: 900; color: #3f3f46; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
      .hud-item span { font-size: 24px; font-weight: 900; font-family: monospace; color: #52525b; }
      .hud-item.active span { color: #fbbf24; text-shadow: 0 0 20px rgba(251,191,36,0.3); }
      .hud-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.05); }

      .selector-control-center { display: flex; gap: 16px; align-items: center; }
      .matrix-search { flex: 1; position: relative; display: flex; align-items: center; height: 56px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0 20px; }
      .matrix-search-input { background: transparent; border: none; color: #fff; font-size: 10px; font-weight: 900; letter-spacing: 0.2em; outline: none; width: 100%; padding-left: 12px; }
      .matrix-btn { height: 56px; padding: 0 28px; border-radius: 12px; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); color: #fbbf24; font-size: 9px; font-weight: 900; text-transform: uppercase; display: flex; align-items: center; gap: 12px; transition: 0.3s; }
      .matrix-btn:hover { background: #fbbf24; color: #000; }

      .product-selector-scrim { position: fixed; inset: 0; z-index: 9000; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); opacity: 0; pointer-events: none; transition: 0.35s; }
      .product-selector-scrim.active { opacity: 1; pointer-events: auto; }
      .product-selector-window.active { transform: translateX(0); }

      .product-selector-window { width: min(460px, 92vw); padding: 18px; gap: 12px; background: linear-gradient(180deg, rgba(15,15,18,0.98), rgba(4,4,6,0.995)); border-right-color: rgba(251,191,36,0.16); box-shadow: 24px 0 72px rgba(0,0,0,0.62); }
      .selector-blueprint-overlay { background-image: linear-gradient(rgba(251,191,36,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.02) 1px, transparent 1px); background-size: 34px 34px; opacity: 1; }
      .selector-window-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.07); }
      .selector-title { font-size: 24px; line-height: 0.95; margin: 8px 0 12px; max-width: 300px; }
      .selector-stats-hud { gap: 12px; flex-wrap: wrap; }
      .hud-item small { font-size: 7px; letter-spacing: 0.16em; }
      .hud-item span { font-size: 18px; }
      .hud-divider { height: 26px; }
      .flagship-close-btn { width: 38px; height: 38px; border-radius: 9px; color: #fbbf24; background: rgba(251,191,36,0.08); border-color: rgba(251,191,36,0.18); flex: 0 0 auto; }
      .flagship-close-btn:hover { transform: none; color: #000; background: #fbbf24; }
      .selector-control-center { display: grid; grid-template-columns: 1fr auto; gap: 10px; }
      .matrix-search { height: 46px; border-radius: 10px; padding: 0 14px; }
      .matrix-search-input { font-size: 9px; letter-spacing: 0.14em; }
      .matrix-btn { height: 46px; border-radius: 10px; padding: 0 16px; white-space: nowrap; }
      .target-deck-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .target-deck-summary div { min-width: 0; border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 9px; background: rgba(0,0,0,0.28); color: #fbbf24; }
      .target-deck-summary span { display: block; margin-top: 8px; color: #71717a; font-size: 7px; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase; }
      .target-deck-summary strong { display: block; margin-top: 5px; color: white; font-size: 11px; font-weight: 900; overflow-wrap: anywhere; }
      .selector-products-grid { flex: 1; min-height: 0; overflow-y: auto; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-content: start; gap: 10px; padding-right: 1px; }
      .deck-product-card { position: relative; width: 100%; aspect-ratio: 1 / 1; min-height: 0; display: flex; flex-direction: column; justify-content: space-between; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07); background: linear-gradient(180deg, rgba(255,255,255,0.035), rgba(0,0,0,0.28)); padding: 8px; text-align: left; transition: 0.24s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.012); overflow: hidden; }
      .deck-product-card:hover { border-color: rgba(251,191,36,0.26); background: linear-gradient(180deg, rgba(251,191,36,0.08), rgba(0,0,0,0.24)); transform: none; }
      .deck-product-card.selected { border-color: rgba(251,191,36,0.5); background: linear-gradient(180deg, rgba(251,191,36,0.14), rgba(0,0,0,0.25)); box-shadow: inset 0 0 0 1px rgba(251,191,36,0.25); }
      .deck-product-media { position: relative; width: 100%; height: 52%; border-radius: 7px; overflow: hidden; background: #050507; border: 1px solid rgba(255,255,255,0.08); color: #52525b; display: flex; align-items: center; justify-content: center; }
      .deck-product-media img { width: 100%; height: 100%; object-fit: cover; opacity: 0.82; }
      .deck-discount { position: absolute; left: 4px; bottom: 4px; padding: 2px 4px; border-radius: 4px; background: rgba(0,0,0,0.72); color: #fbbf24; font-size: 7px; font-weight: 900; font-family: monospace; }
      .deck-product-copy { min-width: 0; }
      .deck-product-copy span { color: #71717a; font-size: 6px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; }
      .deck-product-copy h4 { margin-top: 2px; color: white; font-size: 10px; line-height: 1.05; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .deck-price-row { display: flex; align-items: center; gap: 4px; margin-top: 4px; color: #52525b; min-width: 0; }
      .deck-price-row strong { color: #71717a; font-size: 7px; font-weight: 900; font-family: monospace; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .deck-price-row .target { color: #fbbf24; }
      .deck-select-indicator { position: absolute; right: 7px; top: 7px; width: 24px; height: 24px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.12); background: rgba(0,0,0,0.58); color: #a1a1aa; display: flex; align-items: center; justify-content: center; transition: 0.25s; backdrop-filter: blur(12px); }
      .deck-product-card.selected .deck-select-indicator { color: #000; background: #fbbf24; border-color: #fbbf24; }
      .selector-footer-actions { padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.07); }
      .selector-footer-actions button { width: 100%; height: 46px; border-radius: 10px; background: #fbbf24; color: #000; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 9px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase; }

      .flagship-scrollbar::-webkit-scrollbar { width: 4px; }
      .flagship-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.2); border-radius: 10px; }

      /* ══ PROTOCOL TICKET CARDS ══ */
      .promo-ticket-grid { display: grid; gap: 14px; padding: 24px; }

      .promo-ticket-card {
        position: relative;
        display: grid;
        grid-template-columns: 8px 88px 1fr auto;
        align-items: stretch;
        min-height: 110px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.07);
        background: linear-gradient(105deg, rgba(18,18,21,0.98) 0%, rgba(9,9,11,0.99) 100%);
        overflow: hidden;
        transition: border-color 0.22s, box-shadow 0.22s;
      }
      .promo-ticket-card:hover { border-color: rgba(251,191,36,0.2); box-shadow: 0 6px 28px rgba(0,0,0,0.45); }
      .promo-ticket-card.paused { filter: grayscale(0.3); opacity: 0.72; }

      /* State Rail */
      .ptc-state-rail {
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
        background: rgba(82,82,91,0.12); border-right: 1px solid rgba(255,255,255,0.04);
        transition: background 0.3s;
      }
      .ptc-state-rail.on { background: rgba(34,197,94,0.08); border-right-color: rgba(34,197,94,0.12); }
      .ptc-rail-dot { width: 6px; height: 6px; border-radius: 50%; background: #3f3f46; transition: background 0.3s, box-shadow 0.3s; }
      .ptc-state-rail.on .ptc-rail-dot { background: #22c55e; box-shadow: 0 0 10px rgba(34,197,94,0.6); animation: rail-pulse 2s ease-in-out infinite; }
      .ptc-rail-label { writing-mode: vertical-rl; transform: rotate(180deg); font-size: 6px; font-weight: 900; letter-spacing: 0.22em; color: #52525b; text-transform: uppercase; transition: color 0.3s; }
      .ptc-state-rail.on .ptc-rail-label { color: #4ade80; }
      @keyframes rail-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

      /* Media --*/
      .ptc-media {
        position: relative; margin: 10px 0 10px 10px; border-radius: 10px;
        overflow: hidden; background: #060608; border: 1px solid rgba(255,255,255,0.07);
        display: flex; align-items: center; justify-content: center;
      }
      .ptc-media img { width: 100%; height: 100%; object-fit: cover; opacity: 0.82; }
      .ptc-media-vignette { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.72)); pointer-events: none; }
      .ptc-hologram-grid { position: absolute; inset: 0; background-image: radial-gradient(rgba(251,191,36,0.1) 1px, transparent 1px); background-size: 8px 8px; opacity: 0.4; pointer-events: none; }
      .ptc-scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 1px; background: rgba(251,191,36,0.3); box-shadow: 0 0 10px #fbbf24; animation: scan-anim 4s linear infinite; pointer-events: none; opacity: 0.6; }
      @keyframes scan-anim { 0% { top: 0; } 100% { top: 100%; } }

      .ptc-badge {
        position: absolute; left: 6px; bottom: 6px;
        background: #fbbf24; color: #000;
        font-size: 11px; font-weight: 900; font-family: monospace;
        padding: 2px 7px; border-radius: 6px; line-height: 1.6;
        border: 1px solid rgba(0,0,0,0.15);
      }

      /* Content --*/
      .ptc-content { min-width: 0; padding: 12px 14px; display: flex; flex-direction: column; justify-content: center; gap: 8px; }

      .ptc-header-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .ptc-codename-group { display: flex; align-items: center; gap: 4px; }
      .ptc-codename {
        display: inline-flex; align-items: center; gap: 5px;
        height: 22px; padding: 0 9px; border-radius: 6px;
        border: 1px solid rgba(251,191,36,0.18); background: rgba(251,191,36,0.06);
        color: #fbbf24; font-size: 8px; font-weight: 900; letter-spacing: 0.18em;
        text-transform: uppercase; font-family: monospace; transition: all 0.3s;
      }
      .ptc-codename.copied { background: #fbbf24; color: #000; }
      .ptc-copy-btn { width: 22px; height: 22px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); color: #52525b; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
      .ptc-copy-btn:hover { color: #fbbf24; border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.05); }

      .ptc-node-id { color: #3f3f46; font-size: 8px; font-weight: 900; font-family: monospace; letter-spacing: 0.12em; }

      .ptc-product-name {
        color: #f4f4f5; font-size: 16px; font-weight: 900; letter-spacing: -0.02em;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.1;
      }

      .ptc-data-row { display: flex; align-items: center; gap: 0; min-width: 0; }
      .ptc-data-cell { display: flex; flex-direction: column; gap: 3px; }
      .ptc-data-cell span { color: #52525b; font-size: 6.5px; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase; }
      .ptc-data-cell strong { color: #a1a1aa; font-size: 10px; font-weight: 900; font-family: monospace; white-space: nowrap; }
      .ptc-data-cell strong.amber { color: #fbbf24; }
      .ptc-data-sep { width: 1px; height: 24px; background: rgba(255,255,255,0.06); margin: 0 12px; flex-shrink: 0; }

      /* Telemetry HUD --*/
      .ptc-telemetry-hud {
        display: flex; align-items: center; gap: 12px;
        margin-top: 4px; padding: 6px 10px;
        background: rgba(0,0,0,0.2); border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.035);
      }
      .ptc-pulse-group { display: flex; align-items: flex-end; gap: 2px; height: 12px; }
      .ptc-pulse-bar { width: 2px; background: #fbbf24; opacity: 0.6; border-radius: 1px; animation: pulse-height 1.2s ease-in-out infinite; }
      .ptc-pulse-bar:nth-child(2n) { animation-delay: 0.2s; height: 40%; }
      .ptc-pulse-bar:nth-child(3n) { animation-delay: 0.4s; height: 70%; }
      .ptc-pulse-bar:nth-child(4n) { animation-delay: 0.6s; height: 30%; }
      @keyframes pulse-height { 0%, 100% { height: 20%; } 50% { height: 100%; } }

      .ptc-hash-trace { color: #52525b; font-size: 7px; font-weight: 900; font-family: monospace; display: flex; align-items: center; letter-spacing: 0.05em; }
      .ptc-hash-trace span { color: #71717a; }
      .ptc-stream-status { margin-left: auto; display: flex; align-items: center; gap: 5px; color: #3f3f46; font-size: 6.5px; font-weight: 950; letter-spacing: 0.1em; }
      .ptc-blink-dot { width: 4px; height: 4px; border-radius: 50%; background: #22c55e; animation: blink 1s steps(2) infinite; }
      @keyframes blink { 0% { opacity: 0; } 100% { opacity: 1; } }

      /* Action Column --*/
      .ptc-action-col {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 10px; padding: 12px 14px;
        border-left: 1px solid rgba(255,255,255,0.05);
        background: rgba(255,255,255,0.012);
      }

      .ptc-toggle-wrapper { display: flex; flex-direction: column; align-items: center; gap: 5px; }
      .ptc-toggle-label { font-size: 6px; font-weight: 900; letter-spacing: 0.18em; color: #52525b; text-transform: uppercase; transition: color 0.25s; }
      .ptc-toggle-wrapper:has(.ptc-toggle.on) .ptc-toggle-label { color: #fbbf24; text-shadow: 0 0 14px rgba(251,191,36,0.35); }

      .ptc-toggle {
        position: relative; width: 46px; height: 24px; border-radius: 999px;
        background: linear-gradient(180deg, rgba(24,24,27,0.98), rgba(9,9,11,0.98));
        border: 1px solid rgba(255,255,255,0.11);
        cursor: pointer; flex-shrink: 0;
        overflow: hidden;
        transition: background 0.25s, border-color 0.25s, box-shadow 0.25s, transform 0.25s;
        box-shadow: inset 0 1px 4px rgba(0,0,0,0.75), 0 8px 24px rgba(0,0,0,0.22);
      }
      .ptc-toggle:hover { transform: translateY(-1px); border-color: rgba(251,191,36,0.28); }
      .ptc-toggle.on {
        background: linear-gradient(90deg, rgba(120,53,15,0.95), rgba(251,191,36,0.28));
        border-color: rgba(251,191,36,0.5);
        box-shadow: inset 0 1px 4px rgba(0,0,0,0.35), 0 0 22px rgba(251,191,36,0.22);
      }
      .ptc-toggle-glow {
        position: absolute; inset: 3px; border-radius: inherit;
        background: radial-gradient(circle at 18% 50%, rgba(255,255,255,0.08), transparent 45%);
        opacity: 0.4; transition: 0.25s;
      }
      .ptc-toggle.on .ptc-toggle-glow {
        background: radial-gradient(circle at 82% 50%, rgba(254,243,199,0.7), transparent 42%);
        opacity: 1;
      }
      .ptc-thumb {
        position: absolute; top: 3px; left: 3px;
        width: 16px; height: 16px; border-radius: 999px;
        background: linear-gradient(180deg, #71717a, #3f3f46);
        border: 1px solid rgba(255,255,255,0.12);
        transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), background 0.25s, box-shadow 0.25s;
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      }
      .ptc-toggle.on .ptc-thumb {
        transform: translateX(22px);
        background: linear-gradient(180deg, #fef3c7, #f59e0b);
        border-color: rgba(254,243,199,0.55);
        box-shadow: 0 2px 10px rgba(251,191,36,0.55), 0 0 18px rgba(251,191,36,0.35);
      }

      /* Erase Button */
      .ptc-erase-btn {
        width: 30px; height: 30px; border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03);
        color: #52525b; display: flex; align-items: center; justify-content: center;
        transition: 0.2s; cursor: pointer;
      }
      .ptc-erase-btn:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.28); color: #fca5a5; }
      .ptc-erase-btn.armed { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.44); color: #f87171; }
      .ptc-erase-btn:disabled { cursor: not-allowed; color: #71717a; background: rgba(255,255,255,0.025); border-color: rgba(255,255,255,0.05); opacity: 0.55; }
      .ptc-erase-btn:disabled:hover { transform: none; color: #71717a; background: rgba(255,255,255,0.025); border-color: rgba(255,255,255,0.05); }

      @media (max-width: 1024px) {
        .campaign-forge-sidebar { position: relative; top: auto; }
      }
    </style>
  `
})
export class VendeurPromotionsComponent implements OnInit, AfterViewInit, OnDestroy {
  private vendeurService = inject(VendeurService);
  private notify = inject(NexusNotificationService);

  products = signal<Produit[]>([]);
  myProductsWithPromo = signal<Produit[]>([]);

  selectedProductIds = signal<number[]>([]);
  isProductSelectorOpen = signal(false);
  campaignWord = '';
  promoData = { pourcentage: 0, dateFin: '' };

  // Flagship Delete Confirmation System
  pendingDeleteAction = signal<{ id: number, name: string } | null>(null);
  activeDeleteElement: HTMLElement | null = null;
  deleteBtnPos = signal({ x: 0, y: 0 });
  windowWidth = signal(window.innerWidth);
  windowHeight = signal(window.innerHeight);
  Date = Date;

  copyingId = signal<number | null>(null);

  // Real-time Metrics
  activeCampaignsCount = computed(() => this.myProductsWithPromo().filter(p => p.promoActive).length);
  pausedCampaignsCount = computed(() => this.myProductsWithPromo().filter(p => !p.promoActive).length);
  avgDiscount = computed(() => {
    const data = this.myProductsWithPromo();
    if (data.length === 0) return 0;
    return Math.round(data.reduce((acc, p) => acc + (p.promo || 0), 0) / data.length);
  });
  expiringSoonCount = computed(() => {
    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    return this.myProductsWithPromo().filter(p => {
      if (!p.promoEnd) return false;
      const end = new Date(p.promoEnd);
      return end > now && end < fortyEightHoursFromNow;
    }).length;
  });

  @HostListener('window:scroll')
  onScroll() {
    if (this.pendingDeleteAction() && this.activeDeleteElement) {
      const rect = this.activeDeleteElement.getBoundingClientRect();
      this.deleteBtnPos.set({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.windowWidth.set(window.innerWidth);
    this.windowHeight.set(window.innerHeight);
  }

  filamentPath = computed(() => {
    const pos = this.deleteBtnPos();
    const ax = this.alertAnchorX();
    const ay = this.alertAnchorY();
    return `M ${pos.x} ${pos.y} Q ${(pos.x + ax) / 2} ${Math.min(pos.y, ay) - 42} ${ax} ${ay}`;
  });

  alertLeft = computed(() => {
    const preferred = this.deleteBtnPos().x - 286;
    return Math.min(Math.max(preferred, 16), this.windowWidth() - 276);
  });

  alertTop = computed(() => {
    const preferred = this.deleteBtnPos().y - 74;
    return Math.min(Math.max(preferred, 86), this.windowHeight() - 176);
  });

  alertAnchorX = computed(() => this.alertLeft() + 252);
  alertAnchorY = computed(() => this.alertTop() + 36);

  ngOnInit() {
    this.loadData();
    this.generateCampaignWord();
  }

  ngAfterViewInit() { }

  ngOnDestroy() { }

  loadData() {
    this.vendeurService.getMesProduits().subscribe(data => {
      // Deduplicate products by ID for the "Campaign Forge" selector
      const uniqueProducts = Array.from(new Map(data.map(p => [p.id, p])).values());
      this.products.set(uniqueProducts);
      
      // Keep flattened list for the actual promotion tickets board
      this.myProductsWithPromo.set(data.filter(p => p.promo && p.promo > 0));
    });
  }

  applyPromo() {
    if (!this.selectedProductIds().length) return;
    
    const observables = this.selectedProductIds().map(id => 
      this.vendeurService.addPromotionLocale(id, { 
        pourcentage: this.promoData.pourcentage, 
        dateFin: this.promoData.dateFin,
        nom: this.campaignWord 
      })
    );
    forkJoin(observables).subscribe(() => {
      this.loadData();
      this.notify.success(`Protocol ${this.campaignWord} Déployé`);
      this.selectedProductIds.set([]);
      this.isProductSelectorOpen.set(false);
      this.generateCampaignWord();
      this.promoData = { pourcentage: 0, dateFin: '' };
    });
  }

  generateCampaignWord() {
    const prefixes = ['FLASH', 'PRIME', 'VOLT', 'APEX', 'NOVA', 'HYPER'];
    const suffixes = ['DROP', 'SALE', 'BLITZ', 'RUSH', 'BOOST', 'SYNC'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];
    this.campaignWord = `${p}-${s}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  triggerDeleteConfirm(id: number, name: string, event: MouseEvent) {
    this.activeDeleteElement = event.currentTarget as HTMLElement;
    const rect = this.activeDeleteElement.getBoundingClientRect();
    this.deleteBtnPos.set({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    this.pendingDeleteAction.set({ id, name });
  }

  executeDelete(id: number) {
    this.vendeurService.deletePromotion(id).subscribe({
      next: () => {
        this.loadData();
        this.notify.success('Protocole Promotionnel Réinitialisé');
        this.pendingDeleteAction.set(null);
      },
      error: () => {
        this.notify.error('Suppression impossible pour cette campaign');
        this.pendingDeleteAction.set(null);
      }
    });
  }

  togglePromo(product: Produit) {
    const promoId = product.promoId;
    if (!promoId) {
      this.notify.error('Ticket promotion introuvable');
      return;
    }

    const nextActive = !product.promoActive;
    this.myProductsWithPromo.update(products => products.map(item => (
      item.promoId === promoId ? { ...item, promoActive: nextActive } : item
    )));

    this.vendeurService.togglePromotionById(promoId).pipe(
      catchError(() => this.vendeurService.togglePromotionLocale(product.id).pipe(
        catchError(error => of({ error }))
      ))
    ).subscribe({
      next: (res) => {
        if (res?.error) {
          this.myProductsWithPromo.update(products => products.map(item => (
            item.promoId === promoId ? { ...item, promoActive: product.promoActive } : item
          )));
          this.notify.error('Erreur de synchronisation campaign');
          return;
        }

        const active = typeof res?.active === 'boolean' ? res.active : nextActive;
        this.myProductsWithPromo.update(products => products.map(item => (
          item.promoId === promoId ? { ...item, promoActive: active } : item
        )));
        this.notify.info(active ? 'Campaign activée' : 'Campaign mise en pause');
      },
    });
  }

  projectedLift() {
    const pct = Number(this.promoData.pourcentage) || 0;
    return Math.round(pct * 0.85 + this.selectedProductIds().length * 1.5);
  }

  marginGuard() {
    const pct = Number(this.promoData.pourcentage) || 0;
    return pct > 50 ? 'Critical' : pct > 30 ? 'Watch' : 'Safe';
  }

  toggleProduct(id: number) {
    const current = this.selectedProductIds();
    this.selectedProductIds.set(current.includes(id) ? current.filter(pid => pid !== id) : [...current, id]);
  }

  isProductSelected(id: number) {
    return this.selectedProductIds().includes(id);
  }

  selectAllProducts() {
    const allIds = this.products().map(p => p.id).filter((id): id is number => !!id);
    this.selectedProductIds.set(this.selectedProductIds().length === allIds.length ? [] : allIds);
  }

  selectedProductsLabel() {
    const count = this.selectedProductIds().length;
    return count === 0 ? 'No targets defined' : count === 1 ? '1 product targeted' : `${count} products targeted`;
  }

  selectedProducts() {
    return this.products().filter(p => p.id && this.selectedProductIds().includes(p.id));
  }

  getCodename(nom: string, id: number): string {
    const ops = ['ALPHA', 'BRAVO', 'DELTA', 'ECHO', 'FOXT', 'GOLF', 'HOTEL', 'INDG', 'KILO', 'LIMA'];
    const tags = ['DROP', 'BOLT', 'NOVA', 'APEX', 'ZERO', 'FLUX', 'VOLT', 'SYNC', 'RUSH', 'WAVE'];
    const seed = (nom.charCodeAt(0) + nom.charCodeAt(nom.length - 1) + id) % ops.length;
    return `${ops[seed]}-${tags[(id * 3 + nom.length) % tags.length]}`;
  }

  getDeploymentHash(id: number): string {
    const chars = 'ABCDEF0123456789';
    let hash = '';
    const seed = id * 1337;
    for(let i=0; i<8; i++) {
      hash += chars.charAt((seed + i*i) % chars.length);
    }
    return hash;
  }

  copyCode(code: string, id: number) {
    navigator.clipboard.writeText(code).then(() => {
      this.copyingId.set(id);
      this.notify.info(`Code ${code} copié dans le tampon`);
      setTimeout(() => this.copyingId.set(null), 2000);
    });
  }
}
