import { Component, OnInit, signal, computed, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { VendeurService } from '../../../core/services/vendeur.service';
import { ProductService, Produit, Categorie } from '../../../core/services/product.service';
import { NexusNotificationService } from '../../../core/services/nexus-notification.service';

@Component({
  selector: 'app-vendeur-inventory',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  providers: [CurrencyPipe, DecimalPipe],
  template: `
    <div class="bg-glow"></div>
    <div class="bg-grid"></div>

    <div class="relative z-10 max-w-[1700px] mx-auto px-[4%] pt-20 pb-32">
      
      <!-- Flagship Hero Section -->
      <div class="relative mb-24">
        <h1 class="text-[10rem] md:text-[14rem] font-black tracking-tighter text-white/[0.02] absolute -top-32 -left-12 select-none pointer-events-none uppercase">
          Inventaire
        </h1>
        
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-10 relative z-10">
          <div>
            <div class="flex items-center gap-4 mb-4">
               <span class="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] rounded">Node_Management</span>
               <div class="h-[1px] w-12 bg-zinc-800"></div>
            </div>
            <h2 class="text-7xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
              Gestion des <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-200">Nodes</span>
            </h2>
            <p class="text-zinc-500 font-bold tracking-[0.2em] text-[10px] uppercase flex items-center gap-3">
              <lucide-icon name="database" class="w-4 h-4 text-amber-500"></lucide-icon>
              Protocole d'Approvisionnement Hardware
            </p>
          </div>

          <div class="flex items-center gap-3 rounded-xl border border-white/5 bg-zinc-950/60 px-5 py-4">
            <lucide-icon name="radio-tower" class="w-5 h-5 text-amber-500"></lucide-icon>
            <div>
              <p class="text-[8px] font-black uppercase tracking-[0.35em] text-zinc-600">Command Center</p>
              <p class="text-xs font-black uppercase tracking-[0.18em] text-white">Inventory Live</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Flagship Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div class="flagship-card overflow-hidden">
           <lucide-icon name="package" class="absolute -right-4 -bottom-4 w-24 h-24 text-white/[0.02] -rotate-12 pointer-events-none"></lucide-icon>
           <div class="relative z-10">
              <div class="flex justify-between items-start mb-6">
                 <div class="w-10 h-10 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center">
                    <lucide-icon name="package" class="w-5 h-5 text-zinc-600"></lucide-icon>
                 </div>
                 <span class="text-[9px] font-black text-amber-500 font-mono tracking-widest uppercase bg-amber-500/5 px-2 py-0.5 rounded">Active</span>
              </div>
              <p class="text-[8px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-1">Total Nodes</p>
              <h3 class="text-2xl font-black text-white font-mono tracking-tighter">{{ products().length }}</h3>
           </div>
        </div>

        <div class="flagship-card overflow-hidden">
           <lucide-icon name="bar-chart-3" class="absolute -right-4 -bottom-4 w-24 h-24 text-white/[0.02] -rotate-12 pointer-events-none"></lucide-icon>
           <div class="relative z-10">
              <div class="flex justify-between items-start mb-6">
                 <div class="w-10 h-10 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center">
                    <lucide-icon name="bar-chart-3" class="w-5 h-5 text-zinc-600"></lucide-icon>
                 </div>
                 <span class="text-[9px] font-black text-zinc-600 font-mono tracking-widest uppercase bg-zinc-950 px-2 py-0.5 rounded">Realtime</span>
              </div>
              <p class="text-[8px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-1">Valorisation</p>
              <h3 class="text-2xl font-black text-white font-mono tracking-tighter">{{ totalValue() | currency:'EUR' }}</h3>
           </div>
        </div>

        <div class="flagship-card overflow-hidden border-amber-500/20 bg-amber-500/[0.02]">
           <lucide-icon name="zap" class="absolute -right-4 -bottom-4 w-24 h-24 text-amber-500/[0.03] -rotate-12 pointer-events-none"></lucide-icon>
           <div class="relative z-10">
              <div class="flex justify-between items-start mb-6">
                 <div class="w-10 h-10 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center">
                    <lucide-icon name="zap" class="w-5 h-5 text-amber-500"></lucide-icon>
                 </div>
              </div>
              <p class="text-[8px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-1">Alertes Stock</p>
              <h3 class="text-2xl font-black text-amber-500 font-mono tracking-tighter">{{ lowStockCount() }}</h3>
           </div>
        </div>

        <div class="flagship-card overflow-hidden">
           <lucide-icon name="shield" class="absolute -right-4 -bottom-4 w-24 h-24 text-white/[0.02] -rotate-12 pointer-events-none"></lucide-icon>
           <div class="relative z-10">
              <div class="flex justify-between items-start mb-6">
                 <div class="w-10 h-10 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center">
                    <lucide-icon name="shield" class="w-5 h-5 text-zinc-600"></lucide-icon>
                 </div>
              </div>
              <p class="text-[8px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-1">Health Check</p>
              <h3 class="text-2xl font-black text-white font-mono tracking-tighter uppercase italic">Optimal</h3>
           </div>
        </div>
      </div>

      <!-- Flagship Inventory Command Surface -->
      <div class="inventory-shell">
        <aside class="product-side-panel">
          <div class="side-panel-header">
            <div>
              <p class="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500 mb-3">Vendor Product Console</p>
              <h3 class="text-3xl font-black tracking-tighter text-white leading-none">
                {{ editingId() ? 'Update Product' : 'Add Product' }}
              </h3>
            </div>
            @if (hasProductDraft()) {
              <div class="header-action-cluster">
                <button (click)="saveProduit()" class="header-save-button" [title]="editingId() ? 'Save changes' : 'Add product'">
                  <lucide-icon name="check" class="w-4 h-4"></lucide-icon>
                  <span>{{ editingId() ? 'Save' : 'Add' }}</span>
                </button>
                <button (click)="resetProductForm()" class="header-reset-button" title="Reset form">
                  <lucide-icon name="rotate-ccw" class="w-4 h-4"></lucide-icon>
                </button>
              </div>
            }
          </div>

          <div class="side-preview">
            <img *ngIf="coverPreview()" [src]="coverPreview()" class="side-preview-image" [alt]="formData.nom || 'Product preview'">
            <div *ngIf="!coverPreview()" class="side-preview-empty">
              <div class="preview-empty-icon">
                <lucide-icon name="image-plus" class="w-8 h-8"></lucide-icon>
              </div>
              <strong>Media Deck</strong>
              <span>Attach multiple product angles</span>
            </div>
            <div class="preview-corner top-left"></div>
            <div class="preview-corner top-right"></div>
            <div class="preview-corner bottom-left"></div>
            <div class="preview-corner bottom-right"></div>
            <div class="side-preview-overlay"></div>
            <div class="preview-status">
              <span class="status-dot"></span>
              <strong>{{ mediaDeck().length ? mediaDeck().length + ' Visuals Armed' : 'Visual Pending' }}</strong>
            </div>
            <label class="image-upload-control">
              <lucide-icon name="upload-cloud" class="w-4 h-4"></lucide-icon>
              <span>{{ mediaDeck().length ? 'Add More' : 'Upload' }}</span>
              <input type="file" multiple accept="image/*" (change)="onFileSelected($event)">
            </label>
          </div>

          <div class="media-deck-console">
            <div class="media-deck-head">
              <span>Visual Matrix</span>
              <strong>{{ mediaDeck().length }}/8</strong>
            </div>
            <div class="media-deck-grid">
              @for (img of mediaDeck(); track img; let i = $index) {
                <button type="button" class="media-tile" [class.cover]="img === formData.image" (click)="setCoverImage(img)" title="Set as cover">
                  <img [src]="img" [alt]="'Product visual ' + (i + 1)">
                  <span class="media-index">{{ (i + 1).toString().padStart(2, '0') }}</span>
                  @if (img === formData.image) {
                    <span class="media-cover-badge">Cover</span>
                  }
                  <span class="media-remove" (click)="removeImage(img, $event)">
                    <lucide-icon name="x" class="w-3 h-3"></lucide-icon>
                  </span>
                </button>
              }
              @if (mediaDeck().length < 8) {
                <label class="media-add-tile">
                  <lucide-icon name="image-plus" class="w-5 h-5"></lucide-icon>
                  <span>Add</span>
                  <input type="file" multiple accept="image/*" (change)="onFileSelected($event)">
                </label>
              }
            </div>
          </div>

          <div class="side-form">
            <div class="form-field">
              <label>Product Name</label>
              <input type="text" [(ngModel)]="formData.nom" class="form-input-flagship" placeholder="e.g. RTX 4090 TI">
            </div>

            <div class="form-field">
              <label>Category</label>
              <div class="category-select-shell">
                <lucide-icon name="layers-3" class="category-leading-icon w-4 h-4"></lucide-icon>
                <select [(ngModel)]="formData.categorieId" class="form-input-flagship category-select">
                  <option [ngValue]="null">Select category</option>
                  @for (c of categories(); track c.id) {
                    <option [ngValue]="c.id">{{ c.nom }}</option>
                  }
                </select>
                <lucide-icon name="chevron-down" class="category-chevron w-4 h-4"></lucide-icon>
              </div>
            </div>

            <div class="side-form-grid">
              <div class="form-field">
                <label>Price</label>
                <input type="number" [(ngModel)]="formData.prix" class="form-input-flagship font-mono" placeholder="0.00">
              </div>
              <div class="form-field">
                <label>Quantity</label>
                <input type="number" [(ngModel)]="formData.stock" class="form-input-flagship font-mono" placeholder="0">
              </div>
            </div>

            <div class="form-field">
              <label>Description</label>
              <textarea [(ngModel)]="formData.description" class="form-input-flagship side-textarea" placeholder="Technical details, specifications, warranty notes..."></textarea>
            </div>
          </div>

        </aside>

        <section class="product-grid">
          @for (p of products(); track p.id) {
            <article class="product-card group">
              <div class="product-media">
                <img *ngIf="coverImage(p)" [src]="coverImage(p)" [alt]="p.nom" class="product-image">
                <div *ngIf="!coverImage(p)" class="product-image-placeholder">
                  <lucide-icon name="package-open" class="w-12 h-12 text-zinc-700"></lucide-icon>
                  <span>Visual Pending</span>
                </div>
                <div class="product-gradient"></div>
                @if (galleryImages(p).length > 1) {
                  <div class="inventory-gallery-switcher">
                    @for (img of galleryImages(p); track img; let i = $index) {
                      <button
                        class="inventory-gallery-node"
                        [class.active]="activeProductImage(p) === img"
                        (click)="setActiveProductImage(p.id!, img, $event)"
                        [title]="'Visual ' + (i + 1)"
                      >
                        <img [src]="img" [alt]="'Visual ' + (i + 1)">
                      </button>
                    }
                  </div>
                }
                <div class="product-badges">
                  <span>{{ p.categorie?.nom || 'Uncategorized' }}</span>
                  @if (galleryCount(p) > 1) {
                    <span>{{ galleryCount(p) }} visuals</span>
                  }
                  <span [class.badge-danger]="p.stock <= 5" [class.badge-warn]="p.stock > 5 && p.stock <= 20" [class.badge-ok]="p.stock > 20">
                    {{ stockStatus(p) }}
                  </span>
                </div>
                <div class="product-actions">
                  <button (click)="openEditModal(p)" title="Edit product">
                    <lucide-icon name="edit-3" class="w-4 h-4"></lucide-icon>
                  </button>
                  <button (click)="triggerDeleteConfirm(p.id!, p.nom, $event)" title="Delete product" class="danger-action" [ngClass]="{'bg-amber-500 text-black border-amber-400': pendingDeleteAction()?.id === p.id}">
                    <lucide-icon name="trash-2" class="w-4 h-4"></lucide-icon>
                  </button>
                </div>
              </div>

              <div class="product-body">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-[8px] font-black uppercase tracking-[0.35em] text-zinc-600 mb-2">Product Node #{{ p.id }}</p>
                    <h3 class="product-title">{{ p.nom }}</h3>
                  </div>
                  <span class="product-price">{{ p.prix | currency:'EUR' }}</span>
                </div>

                <p class="product-description">{{ p.description || 'No technical description attached to this product node yet.' }}</p>

                <div class="stock-matrix">
                  <div>
                    <span>Stock Capacity</span>
                    <strong [class.text-red-500]="p.stock <= 5">{{ p.stock }}</strong>
                  </div>
                  <div>
                    <span>Inventory Value</span>
                    <strong>{{ productValue(p) | currency:'EUR' }}</strong>
                  </div>
                </div>

                <div class="stock-bar">
                  <div [style.width.%]="stockPercent(p)"
                       [class.bg-red-500]="p.stock <= 5"
                       [class.bg-amber-500]="p.stock > 5 && p.stock <= 20"
                       [class.bg-green-500]="p.stock > 20"></div>
                </div>

                <div class="card-footer">
                  <button (click)="openEditModal(p)">
                    <lucide-icon name="settings-2" class="w-4 h-4"></lucide-icon>
                    Manage
                  </button>
                  <button (click)="triggerDeleteConfirm(p.id!, p.nom, $event)" class="delete-link" [ngClass]="{'text-amber-500': pendingDeleteAction()?.id === p.id}">
                    <lucide-icon name="trash" class="w-4 h-4"></lucide-icon>
                    Remove
                  </button>
                </div>
              </div>
            </article>
          } @empty {
            <div class="empty-inventory">
              <lucide-icon name="boxes" class="w-12 h-12 text-zinc-700"></lucide-icon>
              <h3>No product nodes deployed</h3>
              <p>Use the side panel to initialize your first inventory product.</p>
            </div>
          }
        </section>
      </div>
    </div>

    <!-- Flagship Neural Action Link (Filament & Orb) -->
    @if (pendingDeleteAction(); as action) {
      <!-- Electric Filament -->
      <svg class="fixed inset-0 z-[990] pointer-events-none w-full h-full">
        <defs>
          <linearGradient id="electricGradientNode" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ef4444" stop-opacity="0" />
            <stop offset="50%" stop-color="#ef4444" stop-opacity="0.8">
              <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stop-color="#ef4444" stop-opacity="0" />
          </linearGradient>
          <filter id="glowNode">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path 
          [attr.d]="filamentPath()"
          fill="none" 
          stroke="url(#electricGradientNode)" 
          stroke-width="3" 
          filter="url(#glowNode)"
          class="animate-filament"
        />
        <circle [attr.cx]="deleteBtnPos().x" [attr.cy]="deleteBtnPos().y" r="4" fill="#ef4444" class="animate-ping" />
      </svg>

      <!-- Flagship Enterprise Destruction Module -->
      <div class="fixed z-[1000] w-[260px] animate-in fade-in zoom-in-95 slide-in-from-right-10 duration-500" [style.left.px]="alertLeft()" [style.top.px]="alertTop()">
        <div class="bg-zinc-950/95 backdrop-blur-3xl border border-red-500/30 rounded-[1.5rem] p-5 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent opacity-60"></div>
          
          <div class="absolute top-0 left-0 w-full h-[2px] bg-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <div class="h-full bg-red-400 animate-scan"></div>
          </div>

          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                <lucide-icon name="shield-alert" class="w-5 h-5"></lucide-icon>
              </div>
              <div class="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center gap-1">
                <div class="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
                <span class="text-[7px] font-black text-red-500 uppercase tracking-[0.15em]">Secure</span>
              </div>
            </div>

            <div class="mb-4">
              <h4 class="text-[7px] font-black text-zinc-500 uppercase tracking-[0.25em] mb-1">Suppression</h4>
              <h2 class="text-lg font-black text-white uppercase tracking-tighter leading-tight mb-1">Détruire <span class="text-red-500 italic">"{{ action.name }}"</span> ?</h2>
              <p class="text-[9px] font-bold text-zinc-400 leading-tight">Action irréversible. Déconnexion du node.</p>
            </div>

            <div class="flex flex-col gap-2">
              <button (click)="executeDelete(action.id)" class="w-full h-11 rounded-xl bg-red-600 text-black text-[10px] font-black uppercase tracking-[0.15em] shadow-[0_12px_25px_rgba(239,68,68,0.2)] hover:bg-red-500 transition-all flex items-center justify-center gap-2">
                <lucide-icon name="trash-2" class="w-3.5 h-3.5"></lucide-icon>
                Confirmer
              </button>
              <button (click)="pendingDeleteAction.set(null)" class="w-full h-11 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:bg-white/10 transition-all">
                Annuler
              </button>
            </div>

            <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between opacity-50">
              <div class="text-[6px] font-black text-zinc-600 uppercase tracking-widest">
                ID: {{ action.id }}
              </div>
              <div class="text-[6px] font-black text-zinc-600 uppercase tracking-widest italic">
                {{ Date.now() | date:'HH:mm:ss' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <style>
      #premium-particles { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
      
      .flagship-card { background: rgba(15, 15, 18, 0.85); backdrop-filter: blur(60px); border: 1px solid rgba(255, 255, 255, 0.06); padding: 24px; border-radius: 8px; position: relative; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      .flagship-card:hover { transform: translateY(-4px); border-color: rgba(251, 191, 36, 0.2); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }

      .inventory-shell { display: grid; grid-template-columns: minmax(360px, 0.38fr) minmax(0, 1fr); gap: 24px; align-items: start; }
      .product-side-panel { position: sticky; top: 76px; height: calc(100vh - 88px); min-height: calc(100vh - 88px); max-height: calc(100vh - 88px); display: flex; flex-direction: column; background: linear-gradient(180deg, rgba(24,24,27,0.96), rgba(8,8,10,0.98)); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 24px; box-shadow: 0 30px 80px rgba(0,0,0,0.45); overflow: hidden; scrollbar-width: none; -ms-overflow-style: none; }
      .product-side-panel::-webkit-scrollbar { display: none; }
      .product-side-panel::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(251,191,36,0.14), transparent 34%, rgba(255,255,255,0.035)); pointer-events: none; }
      .product-side-panel > * { position: relative; z-index: 1; }
      .side-panel-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; margin-bottom: 16px; flex: 0 0 auto; }
      .header-action-cluster { display: inline-flex; align-items: center; gap: 7px; padding: 6px; border-radius: 12px; background: rgba(0,0,0,0.38); border: 1px solid rgba(251,191,36,0.16); box-shadow: inset 0 1px 0 rgba(255,255,255,0.06); animation: header-actions-in 0.24s ease-out both; }
      .header-save-button { min-width: 76px; height: 34px; border-radius: 8px; background: #fbbf24; color: #000; display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-size: 8px; font-weight: 950; letter-spacing: 0.16em; text-transform: uppercase; transition: 0.2s; }
      .header-save-button:hover { background: #fff; transform: translateY(-1px); }
      .header-reset-button { width: 34px; height: 34px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #a1a1aa; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s; }
      .header-reset-button:hover { color: #fff; border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.1); transform: rotate(-18deg); }
      @keyframes header-actions-in { from { opacity: 0; transform: translateX(8px) scale(0.96); } to { opacity: 1; transform: translateX(0) scale(1); } }
      .side-preview { position: relative; height: clamp(180px, 24vh, 220px); flex: 0 0 auto; border-radius: 8px; border: 1px solid rgba(255,255,255,0.09); background: linear-gradient(135deg, rgba(24,24,27,0.98), rgba(0,0,0,0.92)); overflow: hidden; margin-bottom: 14px; box-shadow: inset 0 0 0 1px rgba(251,191,36,0.04), 0 18px 48px rgba(0,0,0,0.36); }
      .side-preview::before { content: ''; position: absolute; inset: 10px; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; pointer-events: none; z-index: 2; }
      .side-preview-image { width: 100%; height: 100%; object-fit: cover; opacity: 0.9; filter: saturate(1.08) contrast(1.03); }
      .side-preview-empty { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: #71717a; text-align: center; background: linear-gradient(135deg, rgba(39,39,42,0.72), rgba(0,0,0,0.92)); }
      .side-preview-empty strong { color: #e4e4e7; font-size: 12px; font-weight: 900; letter-spacing: 0.26em; text-transform: uppercase; }
      .side-preview-empty span { color: #52525b; font-size: 9px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; }
      .preview-empty-icon { width: 62px; height: 62px; border-radius: 8px; border: 1px solid rgba(251,191,36,0.18); background: rgba(251,191,36,0.06); color: #fbbf24; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 34px rgba(251,191,36,0.12); }
      .preview-corner { position: absolute; z-index: 3; width: 24px; height: 24px; border-color: rgba(251,191,36,0.55); pointer-events: none; }
      .preview-corner.top-left { top: 12px; left: 12px; border-top: 1px solid; border-left: 1px solid; }
      .preview-corner.top-right { top: 12px; right: 12px; border-top: 1px solid; border-right: 1px solid; }
      .preview-corner.bottom-left { bottom: 12px; left: 12px; border-bottom: 1px solid; border-left: 1px solid; }
      .preview-corner.bottom-right { bottom: 12px; right: 12px; border-bottom: 1px solid; border-right: 1px solid; }
      .side-preview-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.08), transparent 35%, rgba(0,0,0,0.82)); pointer-events: none; }
      .preview-status { position: absolute; left: 16px; bottom: 16px; z-index: 4; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.12); background: rgba(0,0,0,0.62); color: white; border-radius: 8px; padding: 10px 12px; backdrop-filter: blur(20px); }
      .preview-status strong { font-size: 9px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; }
      .status-dot { width: 7px; height: 7px; border-radius: 999px; background: #fbbf24; box-shadow: 0 0 16px rgba(251,191,36,0.65); }
      .image-upload-control { position: absolute; right: 16px; bottom: 16px; z-index: 4; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(251,191,36,0.28); background: rgba(251,191,36,0.12); color: white; border-radius: 8px; padding: 10px 12px; font-size: 9px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; backdrop-filter: blur(20px); transition: 0.25s; }
      .image-upload-control:hover { background: #fbbf24; color: #000; border-color: #fbbf24; }
      .image-upload-control input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
      .media-deck-console { margin: -4px 0 14px; padding: 10px; flex: 0 0 auto; border-radius: 8px; border: 1px solid rgba(255,255,255,0.07); background: linear-gradient(180deg, rgba(255,255,255,0.025), rgba(0,0,0,0.3)); }
      .media-deck-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; }
      .media-deck-head span { font-size: 8px; font-weight: 950; color: #71717a; text-transform: uppercase; letter-spacing: 0.28em; }
      .media-deck-head strong { font-size: 9px; font-weight: 950; color: #fbbf24; font-family: monospace; letter-spacing: 0.18em; }
      .media-deck-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
      .media-tile, .media-add-tile { position: relative; height: 52px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.36); transition: 0.25s; }
      .media-tile img { width: 100%; height: 100%; object-fit: cover; opacity: 0.74; transition: 0.25s; }
      .media-tile:hover, .media-tile.cover { border-color: rgba(251,191,36,0.62); transform: translateY(-1px); box-shadow: 0 12px 26px rgba(0,0,0,0.28), 0 0 18px rgba(251,191,36,0.08); }
      .media-tile:hover img, .media-tile.cover img { opacity: 1; }
      .media-index { position: absolute; left: 6px; top: 6px; font-size: 7px; font-weight: 950; color: white; font-family: monospace; background: rgba(0,0,0,0.62); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 2px 4px; }
      .media-cover-badge { position: absolute; left: 6px; bottom: 6px; font-size: 6px; font-weight: 950; color: #000; text-transform: uppercase; letter-spacing: 0.12em; background: #fbbf24; border-radius: 4px; padding: 3px 5px; }
      .media-remove { position: absolute; top: 5px; right: 5px; width: 18px; height: 18px; border-radius: 6px; background: rgba(0,0,0,0.72); color: #fca5a5; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(248,113,113,0.22); opacity: 0; transition: 0.2s; }
      .media-tile:hover .media-remove { opacity: 1; }
      .media-add-tile { cursor: pointer; color: #71717a; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-size: 8px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.18em; border-style: dashed; }
      .media-add-tile:hover { color: #fbbf24; border-color: rgba(251,191,36,0.5); background: rgba(251,191,36,0.05); }
      .media-add-tile input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
      .side-form { display: flex; flex-direction: column; gap: 12px; flex: 1; min-height: 0; }
      .form-field label { display: block; color: #71717a; font-size: 9px; font-weight: 900; letter-spacing: 0.28em; text-transform: uppercase; margin-bottom: 7px; }
      .category-select-shell { position: relative; }
      .category-leading-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #fbbf24; z-index: 2; pointer-events: none; }
      .category-chevron { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #71717a; z-index: 2; pointer-events: none; }
      .category-select { appearance: none; padding-left: 44px; padding-right: 44px; background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(0,0,0,0.36)); border-color: rgba(251,191,36,0.16); font-weight: 900; letter-spacing: 0.03em; }
      .category-select:focus { border-color: rgba(251,191,36,0.5); box-shadow: 0 0 0 3px rgba(251,191,36,0.08), 0 0 24px rgba(251,191,36,0.08); }
      .side-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .side-form .form-field:last-child { flex: 1; min-height: 0; display: flex; flex-direction: column; }
      .side-textarea { flex: 1; min-height: 88px; height: auto; resize: none; }
      .stock-matrix span { display: block; color: #71717a; font-size: 8px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase; }

      .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
      .product-card { background: rgba(12,12,15,0.88); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; overflow: hidden; min-width: 0; box-shadow: 0 18px 48px rgba(0,0,0,0.28); }
      .product-card:hover { transform: none; border-color: rgba(255,255,255,0.07); box-shadow: 0 18px 48px rgba(0,0,0,0.28); }
      .product-media { position: relative; height: 160px; background: #09090b; overflow: hidden; }
      .product-image { width: 100%; height: 100%; object-fit: cover; opacity: 0.86; transform: scale(1.01); transition: 0.45s; }
      .product-card:hover .product-image { opacity: 1; transform: scale(1.05); }
      .product-image-placeholder { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #52525b; font-size: 9px; font-weight: 900; letter-spacing: 0.28em; text-transform: uppercase; background: linear-gradient(135deg, rgba(39,39,42,0.6), rgba(0,0,0,0.86)); }
      .inventory-gallery-switcher { position: absolute; left: 12px; top: 50%; z-index: 7; display: flex; flex-direction: column; align-items: center; gap: 7px; padding: 8px 6px; border-radius: 999px; background: linear-gradient(180deg, rgba(0,0,0,0.72), rgba(12,12,15,0.5)); border: 1px solid rgba(251,191,36,0.16); backdrop-filter: blur(18px); opacity: 0; transform: translate(-8px, -50%); transition: 0.25s; box-shadow: 0 18px 36px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.08); }
      .inventory-gallery-switcher::before { content: ''; width: 1px; height: 12px; background: linear-gradient(180deg, transparent, rgba(251,191,36,0.65)); }
      .inventory-gallery-switcher::after { content: ''; width: 1px; height: 12px; background: linear-gradient(180deg, rgba(251,191,36,0.65), transparent); }
      .product-media:hover .inventory-gallery-switcher { opacity: 1; transform: translate(0, -50%); }
      .inventory-gallery-node { width: 30px; height: 30px; border-radius: 999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); background: #09090b; opacity: 0.62; transition: 0.2s; }
      .inventory-gallery-node img { width: 100%; height: 100%; object-fit: cover; }
      .inventory-gallery-node:hover, .inventory-gallery-node.active { opacity: 1; border-color: rgba(251,191,36,0.82); transform: scale(1.08); box-shadow: 0 0 14px rgba(251,191,36,0.22); }
      .product-gradient { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15), transparent 38%, rgba(0,0,0,0.82)); pointer-events: none; }
      .product-badges { position: absolute; left: 14px; right: 14px; top: 14px; display: flex; justify-content: space-between; gap: 10px; }
      .product-badges span { max-width: 58%; border: 1px solid rgba(255,255,255,0.12); background: rgba(0,0,0,0.58); backdrop-filter: blur(20px); color: #e4e4e7; border-radius: 999px; padding: 7px 10px; font-size: 8px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .product-badges .badge-danger { color: #f87171; border-color: rgba(239,68,68,0.32); background: rgba(127,29,29,0.22); }
      .product-badges .badge-warn { color: #fbbf24; border-color: rgba(251,191,36,0.3); background: rgba(113,63,18,0.2); }
      .product-badges .badge-ok { color: #22c55e; border-color: rgba(34,197,94,0.28); background: rgba(20,83,45,0.18); }
      .product-actions { position: absolute; right: 12px; bottom: 12px; display: flex; gap: 6px; }
      .product-actions button { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: white; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(20px); transition: 0.25s; }
      .product-actions button:hover { background: #fbbf24; color: #000; border-color: #fbbf24; }
      .product-actions .danger-action:hover { background: #ef4444; color: white; border-color: #ef4444; }
      .product-body { padding: 16px; }
      .product-title { color: white; font-size: 16px; line-height: 1.1; font-weight: 900; letter-spacing: -0.02em; overflow-wrap: anywhere; }
      .product-price { color: #fbbf24; font-family: monospace; font-size: 13px; font-weight: 900; white-space: nowrap; }
      .product-description { min-height: 36px; margin-top: 10px; color: #71717a; font-size: 11px; line-height: 1.5; font-weight: 600; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .stock-matrix { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px; }
      .stock-matrix div { border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 10px; background: rgba(0,0,0,0.22); }
      .stock-matrix strong { display: block; margin-top: 6px; color: white; font-family: monospace; font-size: 13px; font-weight: 900; overflow-wrap: anywhere; }
      .stock-bar { height: 4px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; margin-top: 14px; }
      .stock-bar div { height: 100%; border-radius: inherit; transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
      .card-footer { display: flex; justify-content: space-between; gap: 10px; align-items: center; margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
      .card-footer button { display: inline-flex; align-items: center; gap: 8px; color: white; font-size: 9px; font-weight: 900; letter-spacing: 0.22em; text-transform: uppercase; transition: 0.25s; }
      .card-footer button:hover { color: #fbbf24; }
      .card-footer .delete-link { color: rgba(248,113,113,0.7); }
      .card-footer .delete-link:hover { color: #ef4444; }
      .empty-inventory { min-height: 420px; grid-column: 1 / -1; border: 1px dashed rgba(255,255,255,0.12); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: rgba(0,0,0,0.22); }
      .empty-inventory h3 { margin-top: 16px; color: white; font-size: 22px; font-weight: 900; letter-spacing: -0.02em; }
      .empty-inventory p { margin-top: 8px; color: #71717a; font-size: 13px; font-weight: 700; }

      .form-input-flagship { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 12px 15px; color: #fff; font-weight: 600; outline: none; transition: 0.3s; }
      .form-input-flagship:focus { border-color: rgba(251, 191, 36, 0.4); background: rgba(255,255,255,0.02); box-shadow: 0 0 20px rgba(251, 191, 36, 0.05); }

      @keyframes dataStream {
        to { stroke-dashoffset: -20; }
      }
      .animate-data-stream {
        animation: dataStream 0.5s linear infinite;
      }

      @media (max-width: 1180px) {
        .inventory-shell { grid-template-columns: 1fr; }
        .product-side-panel { position: relative; top: auto; height: auto; min-height: auto; max-height: none; overflow: visible; }
        .product-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
      }

      @media (max-width: 760px) {
        .product-grid, .side-form-grid, .stock-matrix { grid-template-columns: 1fr; }
        .product-media { height: 210px; }
        .product-side-panel { padding: 18px; }
        .product-body { padding: 16px; }
      }
    </style>
  `
})
export class VendeurInventoryComponent implements OnInit, AfterViewInit, OnDestroy {
  private vendeurService = inject(VendeurService);
  private productService = inject(ProductService);
  private notify = inject(NexusNotificationService);

  products = signal<Produit[]>([]);
  categories = signal<Categorie[]>([]);
  editingId = signal<number | null>(null);

  formData = { nom: '', description: '', prix: 0, stock: 0, categorieId: null as number | null, image: '', images: '' };
  mediaDeck = signal<string[]>([]);
  pendingMediaUploads = signal(0);
  activeProductImages = signal<Record<number, string>>({});

  totalValue = computed(() => this.products().reduce((acc, p) => acc + (p.prix * (p.stock || 0)), 0));
  lowStockCount = computed(() => this.products().filter(p => (p.stock || 0) <= 5).length);
  totalUnits = computed(() => this.products().reduce((acc, p) => acc + (p.stock || 0), 0));
  averagePrice = computed(() => this.products().length ? this.products().reduce((acc, p) => acc + p.prix, 0) / this.products().length : 0);
  activeCategoryCount = computed(() => new Set(this.products().map(p => p.categorie?.id || p.categorie?.nom).filter(Boolean)).size);
  visualCoverage = computed(() => {
    const products = this.products();
    return products.length ? Math.round((products.filter(p => !!this.coverImage(p)).length / products.length) * 100) : 0;
  });
  lowStockProducts = computed(() => this.products().filter(p => (p.stock || 0) <= 5).slice(0, 4));
  stockExposureLabel = computed(() => {
    const critical = this.lowStockCount();
    if (!this.products().length) return 'Idle';
    if (critical > 3) return 'Critical';
    if (critical > 0) return 'Watch';
    return 'Strong';
  });

  // Flagship Delete Confirmation System
  pendingDeleteAction = signal<{ id: number, name: string } | null>(null);
  activeDeleteElement: HTMLElement | null = null;
  deleteBtnPos = signal({ x: 0, y: 0 });
  windowWidth = signal(window.innerWidth);
  windowHeight = signal(window.innerHeight);
  Date = Date;

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
  }

  ngAfterViewInit() {
    // Component init
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  loadData() {
    this.vendeurService.getMesProduits().subscribe(data => {
      // Deduplicate products by ID for the inventory view (since backend flattens promos)
      const uniqueProducts = Array.from(new Map(data.map(p => [p.id, p])).values());
      const currentById = new Map(this.products().map(product => [product.id, product]));
      this.products.set(uniqueProducts.map(product => {
        const current = currentById.get(product.id);
        if (current?.images && !product.images) {
          return { ...product, images: current.images, image: product.image || current.image };
        }
        return product;
      }));
    });
    this.productService.getCategories().subscribe(data => this.categories.set(data));
  }

  resetProductForm() {
    this.editingId.set(null);
    this.formData = { nom: '', description: '', prix: 0, stock: 0, categorieId: null, image: '', images: '' };
    this.mediaDeck.set([]);
  }

  hasProductDraft() {
    return !!this.editingId()
      || !!this.formData.nom.trim()
      || !!this.formData.description.trim()
      || !!this.formData.categorieId
      || Number(this.formData.prix) > 0
      || Number(this.formData.stock) > 0
      || this.mediaDeck().length > 0
      || this.pendingMediaUploads() > 0;
  }

  openEditModal(p: Produit) {
    this.editingId.set(p.id!);
    const deck = this.galleryImages(p);
    this.formData = {
      nom: p.nom,
      description: p.description || '',
      prix: p.prix,
      stock: p.stock || 0,
      categorieId: p.categorie?.id || null,
      image: this.coverImage(p),
      images: JSON.stringify(deck)
    };
    this.mediaDeck.set(deck);
  }

  onFileSelected(event: any) {
    const files = Array.from(event.target.files || []) as File[];
    if (!files.length) return;

    const remainingSlots = Math.max(0, 8 - this.mediaDeck().length);
    const acceptedFiles = files.slice(0, remainingSlots);
    if (!acceptedFiles.length) {
      this.notify.info('Media deck limit reached');
      event.target.value = '';
      return;
    }

    this.pendingMediaUploads.update(count => count + acceptedFiles.length);

    acceptedFiles.forEach(file => {
      this.vendeurService.uploadImage(file).subscribe({
        next: ({ url }) => {
          if (!url) {
            this.notify.error('ImageKit upload returned no URL');
            return;
          }

          this.mediaDeck.update(images => {
            const next = [...images, url].slice(0, 8);
            this.syncMediaPayload(next);
            return next;
          });
          this.notify.success('Image uploaded successfully');
        },
        error: () => {
          this.notify.error('ImageKit upload failed');
          this.pendingMediaUploads.update(count => Math.max(0, count - 1));
        },
        complete: () => this.pendingMediaUploads.update(count => Math.max(0, count - 1))
      });
    });

    event.target.value = '';
  }

  saveProduit() {
    if (this.pendingMediaUploads() > 0) {
      this.notify.info('Media deck synchronization in progress');
      return;
    }

    this.syncMediaPayload(this.mediaDeck());
    const action = this.editingId()
      ? this.vendeurService.updateProduit(this.editingId()!, this.formData as any)
      : this.vendeurService.addProduit(this.formData as any);

    action.subscribe((savedProduct: any) => {
      const localProduct = {
        ...savedProduct,
        ...this.formData,
        id: savedProduct?.id || this.editingId()
      };
      this.products.update(products => {
        if (this.editingId()) {
          return products.map(product => product.id === this.editingId() ? { ...product, ...localProduct } : product);
        }
        return [localProduct, ...products];
      });
      this.loadData();
      this.notify.success(this.editingId() ? 'Product Mis à Jour' : 'Product Deployé avec Succès');
      this.resetProductForm();
    });
  }

  coverPreview() {
    return this.formData.image || this.mediaDeck()[0] || '';
  }

  setCoverImage(image: string) {
    this.formData.image = image;
    this.syncMediaPayload(this.mediaDeck());
  }

  removeImage(image: string, event: MouseEvent) {
    event.stopPropagation();
    const next = this.mediaDeck().filter(item => item !== image);
    this.mediaDeck.set(next);
    this.syncMediaPayload(next);
  }

  coverImage(product: Produit) {
    return this.activeProductImage(product) || product.image || this.galleryImages(product)[0] || '';
  }

  activeProductImage(product: Produit) {
    return product.id ? this.activeProductImages()[product.id] || '' : '';
  }

  setActiveProductImage(productId: number, image: string, event: MouseEvent) {
    event.stopPropagation();
    this.activeProductImages.update(images => ({ ...images, [productId]: image }));
  }

  galleryCount(product: Produit) {
    return this.galleryImages(product).length;
  }

  galleryImages(product: Produit) {
    const raw = product.images;
    if (!raw) return product.image ? [product.image] : [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const parsedImages = parsed.filter((item): item is string => typeof item === 'string' && !!item);
        return Array.from(new Set([product.image, ...parsedImages].filter((item): item is string => !!item)));
      }
    } catch {
      return product.image ? [product.image] : [];
    }

    return product.image ? [product.image] : [];
  }

  private syncMediaPayload(images: string[]) {
    const uniqueImages = Array.from(new Set(images)).slice(0, 8);
    if (!uniqueImages.includes(this.formData.image)) {
      this.formData.image = uniqueImages[0] || '';
    }
    this.formData.images = JSON.stringify(uniqueImages);
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
    this.vendeurService.deleteProduit(id).subscribe(() => {
      this.loadData();
      this.notify.success('Node Désactivé du Nexus');
      this.pendingDeleteAction.set(null);
    });
  }

  productValue(p: Produit) {
    return p.prix * (p.stock || 0);
  }

  stockPercent(p: Produit) {
    return Math.max(4, Math.min(100, p.stock || 0));
  }

  stockStatus(p: Produit) {
    if ((p.stock || 0) <= 5) return 'Critical';
    if ((p.stock || 0) <= 20) return 'Watch';
    return 'Ready';
  }
}
