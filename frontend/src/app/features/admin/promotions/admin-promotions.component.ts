import { Component, OnInit, signal, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ProductService, Produit } from '../../../core/services/product.service';

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, RouterLink],
  template: `
    <div class="bg-glow"></div>
    <div class="bg-grid"></div>

    <div class="relative z-10 min-h-screen text-white pb-32">

      <div class="px-5 sm:px-8 pt-12 pb-8 overflow-hidden">
        <div class="max-w-[1500px] mx-auto">
          <!-- Flagship Control Bar (Horizontal Alignment) -->
          <div class="flex items-center justify-between mb-8">
            <!-- Integrated Return -->
            <a routerLink="/admin/dashboard" class="inline-flex items-center gap-3 group px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all">
              <lucide-icon name="arrow-left" class="w-4 h-4 text-amber-500 group-hover:-translate-x-1 transition-transform"></lucide-icon>
              <span class="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white">Retour au Dashboard</span>
            </a>

            <!-- Alignment Badge -->
            <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500 uppercase tracking-[0.22em] shadow-[0_0_24px_rgba(245,158,11,0.14)] animate-in slide-in-from-right-10 duration-1000">
              <lucide-icon name="ticket-percent" class="w-3 h-3"></lucide-icon>
              Promotion Code Studio
            </div>
          </div>

          <div class="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-8">
            <div class="relative max-w-4xl">
              <h1 class="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] mb-5">
                CENTRE DE
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-white to-zinc-700 uppercase">PROMOTION</span>
              </h1>
              <p class="max-w-2xl text-zinc-400 font-semibold text-sm md:text-base leading-7 border-l-2 border-amber-500/30 pl-5">
                Créez un code promo, ciblez tout le catalogue, une catégorie ou un produit précis, puis lancez une campagne prête à suivre.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3 w-full xl:w-[420px]">
              <div class="p-5 rounded-2xl bg-zinc-900/45 border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
                <p class="text-[10px] font-black text-zinc-600 uppercase tracking-[0.18em] mb-3">Promos actives</p>
                <div class="flex items-baseline gap-3">
                  <span class="text-4xl font-black font-mono tracking-tight text-green-500">{{ activePromotions() }}</span>
                  <lucide-icon name="activity" class="w-5 h-5 text-green-700 group-hover:text-green-500 transition-colors"></lucide-icon>
                </div>
              </div>
              <div class="p-5 rounded-2xl bg-zinc-900/45 border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
                <p class="text-[10px] font-black text-zinc-600 uppercase tracking-[0.18em] mb-3">Remise moyenne</p>
                <div class="flex items-baseline gap-2">
                  <span class="text-4xl font-black font-mono tracking-tight text-amber-400">{{ averageDiscount() }}</span>
                  <span class="text-xl font-black text-amber-500/70">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-[1500px] mx-auto px-5 sm:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-5">
            <div class="p-6 rounded-2xl border border-white/10 bg-zinc-900/45 backdrop-blur-3xl shadow-2xl sticky top-24 overflow-hidden group">
              <div class="absolute -top-20 -right-20 w-56 h-56 bg-amber-500/10 blur-[90px] pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700"></div>

              <h2 class="text-xl font-black mb-6 tracking-tight flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-amber-500">
                  <lucide-icon name="sparkles" class="w-5 h-5"></lucide-icon>
                </div>
                Campaign Studio
              </h2>

              <div class="space-y-5 relative z-10">
                <div class="space-y-2">
                  <div class="flex items-center justify-between gap-3">
                    <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.22em]">Code promotion</label>
                    <button type="button" (click)="generatePromoCode()" class="h-8 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-amber-400 hover:text-black hover:bg-amber-500 transition-all text-[10px] font-black uppercase tracking-[0.12em] inline-flex items-center gap-2">
                      <lucide-icon name="shuffle" class="w-3.5 h-3.5"></lucide-icon>
                      Générer
                    </button>
                  </div>
                  <div class="relative">
                    <input
                      type="text"
                      [(ngModel)]="promoForm.code"
                      (ngModelChange)="normalizeCode()"
                      class="w-full bg-zinc-950/80 border border-white/10 px-5 py-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all font-black text-2xl tracking-[0.12em] uppercase shadow-inner placeholder:text-zinc-700"
                      placeholder="RAMADAN25"
                    />
                    <lucide-icon name="badge-percent" class="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500/70"></lucide-icon>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.22em]">Remise (%)</label>
                    <div class="relative">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        [(ngModel)]="promoForm.pourcentage"
                        class="w-full bg-zinc-950/80 border border-white/10 px-5 py-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all font-black text-4xl tracking-tight shadow-inner"
                        placeholder="20"
                      />
                      <span class="absolute right-5 top-1/2 -translate-y-1/2 text-amber-500 font-black text-2xl opacity-60">%</span>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.22em]">Expiration</label>
                    <input
                      type="date"
                      [(ngModel)]="promoForm.dateFin"
                      class="w-full h-[70px] bg-zinc-950/80 border border-white/10 px-5 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all font-bold uppercase text-sm tracking-wide"
                    />
                  </div>
                </div>

                <div class="space-y-3">
                  <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.22em]">Cible de la promotion</label>
                  <div class="grid grid-cols-3 gap-2 rounded-2xl bg-zinc-950/70 border border-white/10 p-1.5">
                    @for (target of targetModes; track target.value) {
                      <button
                        type="button"
                        (click)="setTargetMode(target.value)"
                        [ngClass]="promoForm.cibleType === target.value ? 'bg-amber-500 text-black shadow-[0_10px_25px_rgba(245,158,11,0.22)]' : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]'"
                        class="h-11 rounded-xl transition-all text-[10px] font-black uppercase tracking-[0.12em] inline-flex items-center justify-center gap-2"
                      >
                        <lucide-icon [name]="target.icon" class="w-4 h-4"></lucide-icon>
                        {{ target.label }}
                      </button>
                    }
                  </div>
                </div>

                @if (promoForm.cibleType === 'CATEGORIE') {
                  <div class="space-y-2 animate-in fade-in duration-300">
                    <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.22em]">Catégorie</label>
                    <div class="relative">
                      <select [(ngModel)]="promoForm.cibleId" class="w-full h-12 appearance-none bg-zinc-950/80 border border-white/10 px-5 pr-12 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all font-bold text-sm">
                        <option [ngValue]="null">Sélectionner une catégorie</option>
                        @for (category of categories(); track category.id) {
                          <option [ngValue]="category.id">{{ category.nom }}</option>
                        }
                      </select>
                      <lucide-icon name="chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none"></lucide-icon>
                    </div>
                  </div>
                }

                @if (promoForm.cibleType === 'PRODUIT') {
                  <div class="space-y-2 animate-in fade-in duration-300">
                    <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.22em]">Produit spécifique</label>
                    <div class="relative">
                      <select [(ngModel)]="promoForm.cibleId" class="w-full h-12 appearance-none bg-zinc-950/80 border border-white/10 px-5 pr-12 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all font-bold text-sm">
                        <option [ngValue]="null">Sélectionner un produit</option>
                        @for (product of products(); track product.id) {
                          <option [ngValue]="product.id">{{ product.nom }} - {{ product.prix }} MAD</option>
                        }
                      </select>
                      <lucide-icon name="chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none"></lucide-icon>
                    </div>
                  </div>
                }

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <p class="text-[10px] text-zinc-600 font-black uppercase tracking-[0.16em] mb-2">Code</p>
                    <p class="text-sm text-white font-black font-mono truncate">{{ promoForm.code || 'A définir' }}</p>
                  </div>
                  <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <p class="text-[10px] text-zinc-600 font-black uppercase tracking-[0.16em] mb-2">Portée</p>
                    <p class="text-sm text-white font-black truncate">{{ targetLabel() }}</p>
                  </div>
                  <div class="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <p class="text-[10px] text-zinc-600 font-black uppercase tracking-[0.16em] mb-2">Impact</p>
                    <p class="text-sm text-white font-black">{{ impactLabel() }}</p>
                  </div>
                </div>

                <div class="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 relative overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
                  <div class="flex items-start gap-3 relative z-10">
                    <lucide-icon name="lightbulb" class="w-4 h-4 text-amber-500 mt-0.5 shrink-0"></lucide-icon>
                    <p class="text-xs text-zinc-400 leading-5 font-semibold">
                      {{ launchBrief() }}
                    </p>
                  </div>
                </div>

                <button
                  (click)="launchPromotion()"
                  [disabled]="!canLaunch()"
                  class="w-full h-12 rounded-xl bg-amber-500 text-black font-black shadow-[0_16px_35px_rgba(245,158,11,0.22)] hover:bg-amber-400 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-xs tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2"
                >
                  <lucide-icon name="send" class="w-4 h-4"></lucide-icon>
                  Lancer la promotion
                </button>
              </div>
            </div>
          </div>

          <div class="lg:col-span-7">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <!-- Flagship Stat Card: Campagnes -->
              <div class="group relative p-6 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-500">
                <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <lucide-icon name="ticket" class="w-32 h-32 text-white"></lucide-icon>
                </div>
                <p class="relative z-10 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Campagnes Actives</p>
                <div class="relative z-10 flex items-baseline gap-2">
                  <p class="text-4xl font-black text-white font-mono tracking-tighter">{{ promotions().length }}</p>
                  <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest">Live Protocols</span>
                </div>
              </div>

              <!-- Flagship Stat Card: Prochaine fin -->
              <div class="group relative p-6 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-2xl overflow-hidden hover:border-red-500/30 transition-all duration-500">
                <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <lucide-icon name="clock" class="w-32 h-32 text-white"></lucide-icon>
                </div>
                <p class="relative z-10 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Prochaine Expiration</p>
                <div class="relative z-10">
                  <p class="text-sm font-black text-zinc-200 uppercase tracking-tight leading-tight">{{ nextExpirationLabel() }}</p>
                  <div class="mt-2 h-1 w-12 bg-red-500/50 rounded-full group-hover:w-full transition-all duration-700"></div>
                </div>
              </div>

              <!-- Flagship Stat Card: Strategic Insights -->
              <div class="group relative p-6 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-500">
                <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <lucide-icon name="shield-check" class="w-32 h-32 text-white"></lucide-icon>
                </div>
                <p class="relative z-10 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Gouvernance Stratégique</p>
                <p class="relative z-10 text-[11px] font-semibold text-zinc-400 leading-relaxed italic">
                  "Optimisez la conversion en limitant les remises globales à 48h pour créer l'urgence systémique."
                </p>
              </div>
            </div>

            <div class="promo-page-list space-y-4">
              @for (promo of paginatedPromotions(); track promo.id) {
                <div class="group relative p-6 rounded-2xl border border-white/10 bg-zinc-900/25 backdrop-blur-3xl hover:bg-white/[0.025] hover:border-amber-500/25 transition-all duration-300 shadow-2xl overflow-hidden">
                  <div class="absolute inset-y-0 left-0 w-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div class="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                    <div class="flex items-center gap-6 w-full xl:w-auto">
                      <div class="relative">
                        <div class="w-20 h-20 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col items-center justify-center group-hover:border-amber-400/30 transition-all shadow-2xl overflow-hidden">
                          <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
                          <span class="text-2xl font-black text-amber-500 tracking-tight relative z-10">{{ promo.pourcentageRemise }}%</span>
                          <span class="text-[8px] text-zinc-600 font-black uppercase tracking-[0.22em] relative z-10">Remise</span>
                        </div>
                        @if (isActive(promo.dateFin)) {
                          <div class="absolute -inset-3 bg-amber-500/10 rounded-3xl blur-2xl animate-pulse -z-10"></div>
                        }
                      </div>

                      <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-3 mb-3">
                          <h4 class="text-xl font-black text-white tracking-tight uppercase group-hover:text-amber-400 transition-colors leading-none">{{ promo.nom || 'PROMO CODE' }}</h4>
                          <span [ngClass]="isActive(promo.dateFin) ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,1)]' : 'bg-zinc-800'" class="w-2.5 h-2.5 rounded-full"></span>
                        </div>
                        <div class="flex flex-wrap items-center gap-5">
                          <div class="flex flex-col">
                            <span class="text-[9px] font-black text-zinc-700 uppercase tracking-[0.22em] mb-1.5">Cible</span>
                            <span class="text-sm font-black text-zinc-400 flex items-center gap-3 uppercase">
                              <lucide-icon name="crosshair" class="w-4 h-4 text-blue-500"></lucide-icon>
                              {{ promo.cibleType || (promo.global ? 'GLOBAL' : 'PRODUIT') }}
                            </span>
                          </div>
                          <div class="w-[1px] h-10 bg-white/5"></div>
                          <div class="flex flex-col">
                            <span class="text-[9px] font-black text-zinc-700 uppercase tracking-[0.22em] mb-1.5">Expiration</span>
                            <span class="text-sm font-bold text-zinc-400 flex items-center gap-3 font-mono">
                              <lucide-icon name="clock" class="w-4 h-4 text-amber-500"></lucide-icon>
                              {{ promo.dateFin | date:'MMMM d, y' | uppercase }}
                            </span>
                          </div>
                          <div class="w-[1px] h-10 bg-white/5"></div>
                          <div class="flex flex-col">
                            <span class="text-[9px] font-black text-zinc-700 uppercase tracking-[0.22em] mb-1.5">Jours restants</span>
                            <span class="text-sm font-black text-zinc-400 flex items-center gap-3 uppercase">{{ daysRemaining(promo.dateFin) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

            <div class="flex items-center gap-6 w-full xl:w-auto justify-between xl:justify-end">
                      <div class="flex flex-col items-end gap-2">
                        <p class="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] group-hover:text-amber-500/60 transition-colors">Système Statut</p>
                        <button (click)="toggleStatus(promo.id)" class="group/switch relative w-14 h-7 rounded-full transition-all duration-500 overflow-hidden border border-white/10 p-1" [ngClass]="isCurrentlyActive(promo) ? 'bg-amber-500/20 border-amber-500/30' : 'bg-zinc-900'">
                          <!-- Track Glow -->
                          <div class="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent opacity-0 transition-opacity duration-500" [ngClass]="{'opacity-100': isCurrentlyActive(promo)}"></div>
                          
                          <!-- Slider Thumb -->
                          <div class="relative w-5 h-5 rounded-full transition-all duration-500 shadow-xl flex items-center justify-center z-10" 
                               [ngClass]="isCurrentlyActive(promo) ? 'translate-x-7 bg-amber-500 shadow-amber-500/40' : 'translate-x-0 bg-zinc-700 shadow-black/50'">
                            <div class="w-1.5 h-1.5 rounded-full bg-white/40" [ngClass]="{'bg-black/20': isCurrentlyActive(promo)}"></div>
                          </div>

                          <!-- Active Pulse -->
                          <div *ngIf="isCurrentlyActive(promo)" class="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></div>
                        </button>
                        <span class="text-[8px] font-black uppercase tracking-widest transition-colors" [ngClass]="isCurrentlyActive(promo) ? 'text-amber-500' : 'text-zinc-700'">
                          {{ isCurrentlyActive(promo) ? 'Propagé' : 'Inactif' }}
                        </span>
                      </div>
                      
                      <button (click)="triggerDeleteConfirm(promo.id, promo.nom || 'CODE PROMO', $event)" 
                              [ngClass]="{'bg-red-600 border-red-500 text-white opacity-100': pendingDeleteAction()?.id === promo.id}"
                              class="w-11 h-11 rounded-xl bg-zinc-950 border border-white/10 text-zinc-700 hover:text-red-500 hover:border-red-500/40 transition-all opacity-60 group-hover:opacity-100 shadow-2xl inline-flex items-center justify-center" title="Retirer">
                        <lucide-icon name="trash-2" class="w-5 h-5"></lucide-icon>
                      </button>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="py-24 text-center rounded-2xl border border-dashed border-white/10 bg-zinc-900/10">
                  <lucide-icon name="zap-off" class="w-16 h-16 text-zinc-800 mx-auto mb-6"></lucide-icon>
                  <p class="text-xl font-black text-zinc-700 uppercase tracking-[0.18em]">Aucune promotion active</p>
                </div>
              }
            </div>

            @if (promotions().length > pageSize) {
              <div class="promo-pagination">
                <button type="button" class="page-nav" (click)="previousPromoPage()" [disabled]="promoPage() === 1" title="Page précédente">
                  <lucide-icon name="arrow-left" class="w-4 h-4"></lucide-icon>
                </button>

                <div class="page-rail">
                  <div class="page-rail-meta">
                    <span>Campagnes</span>
                    <strong>{{ pageStartIndex() + 1 }}-{{ pageEndIndex() }} / {{ promotions().length }}</strong>
                  </div>
                  <div class="page-dots">
                    @for (page of promoPages(); track page) {
                      <button
                        type="button"
                        (click)="goToPromoPage(page)"
                        [class.active]="promoPage() === page"
                        [attr.aria-label]="'Page ' + page"
                      >
                        <span>{{ page }}</span>
                      </button>
                    }
                  </div>
                </div>

                <button type="button" class="page-nav next" (click)="nextPromoPage()" [disabled]="promoPage() === totalPromoPages()" title="Page suivante">
                  <lucide-icon name="arrow-right" class="w-4 h-4"></lucide-icon>
                </button>
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
            <linearGradient id="electricGradientPromo" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ef4444" stop-opacity="0" />
              <stop offset="50%" stop-color="#ef4444" stop-opacity="0.8">
                <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stop-color="#ef4444" stop-opacity="0" />
            </linearGradient>
            <filter id="glowPromo">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path 
            [attr.d]="filamentPath()"
            fill="none" 
            stroke="url(#electricGradientPromo)" 
            stroke-width="3" 
            filter="url(#glowPromo)"
            class="animate-filament"
          />
          <circle [attr.cx]="deleteBtnPos().x" [attr.cy]="deleteBtnPos().y" r="4" fill="#ef4444" class="animate-ping" />
        </svg>
      <!-- Flagship Enterprise Destruction Module (Redesigned & Ultra-Compact) -->
      <div class="fixed z-[1000] w-[260px] animate-in fade-in zoom-in-95 slide-in-from-right-10 duration-500" [style.left.px]="alertLeft()" [style.top.px]="alertTop()">
        <div class="bg-zinc-950/95 backdrop-blur-3xl border border-red-500/30 rounded-[1.5rem] p-5 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden group">
          <!-- Animated Background Elements -->
          <div class="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent opacity-60"></div>
          
          <!-- Scanning Progress Line -->
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
              <h4 class="text-[7px] font-black text-zinc-500 uppercase tracking-[0.25em] mb-1">Retrait</h4>
              <h2 class="text-lg font-black text-white uppercase tracking-tighter leading-tight mb-1">Retirer <span class="text-red-500 italic">"{{ action.name }}"</span> ?</h2>
              <p class="text-[9px] font-bold text-zinc-400 leading-tight">Action irréversible. Suspension immédiate.</p>
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

            <!-- Footer Meta -->
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

      <!-- Flagship Notification System (Toast) -->
      @if (activeToast(); as toast) {
        <div class="fixed bottom-10 right-10 z-[1000] min-w-[320px] bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-2xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex items-center gap-5 animate-in slide-in-from-right-10 duration-500 group overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative w-12 h-12 rounded-xl flex items-center justify-center" [ngClass]="toast.type === 'success' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'">
             <lucide-icon [name]="toast.type === 'success' ? 'check-circle' : 'alert-circle'" class="w-6 h-6"></lucide-icon>
             <div class="absolute inset-0 rounded-xl blur-xl opacity-20" [ngClass]="toast.type === 'success' ? 'bg-amber-500' : 'bg-red-500'"></div>
          </div>
          <div class="flex-1">
            <p class="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Notification Système</p>
            <p class="text-sm font-bold text-white leading-tight uppercase tracking-tight">{{ toast.message }}</p>
          </div>
          <button (click)="activeToast.set(null)" class="text-zinc-600 hover:text-white transition-colors">
            <lucide-icon name="x" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .promo-page-list {
      min-height: 512px;
      display: flex;
      flex-direction: column;
    }
    .promo-pagination {
      margin-top: 1.35rem;
      padding: 0.75rem;
      border-radius: 1.35rem;
      display: grid;
      grid-template-columns: 48px minmax(0, 1fr) 48px;
      gap: 0.75rem;
      align-items: center;
      background: linear-gradient(135deg, rgba(24,24,27,0.74), rgba(5,5,6,0.9));
      border: 1px solid rgba(255,255,255,0.09);
      box-shadow: 0 24px 70px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08);
      overflow: hidden;
      position: relative;
    }
    .promo-pagination::before {
      content: '';
      position: absolute;
      left: 18px;
      right: 18px;
      top: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(245,158,11,0.9), rgba(255,255,255,0.45), transparent);
    }
    .page-nav {
      width: 48px;
      height: 48px;
      border-radius: 1rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #f59e0b;
      background: rgba(245,158,11,0.09);
      border: 1px solid rgba(245,158,11,0.18);
      transition: 0.2s ease;
    }
    .page-nav:hover:not(:disabled) {
      color: #050506;
      background: #f59e0b;
      transform: translateY(-2px);
      box-shadow: 0 14px 34px rgba(245,158,11,0.18);
    }
    .page-nav:disabled {
      opacity: 0.34;
      cursor: not-allowed;
    }
    .page-rail {
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.35rem 0.5rem;
    }
    .page-rail-meta span {
      display: block;
      color: #71717a;
      font-size: 0.56rem;
      font-weight: 950;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      margin-bottom: 0.2rem;
    }
    .page-rail-meta strong {
      display: block;
      color: white;
      font-family: monospace;
      font-size: 0.86rem;
      font-weight: 950;
      white-space: nowrap;
    }
    .page-dots {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.45rem;
      flex-wrap: wrap;
    }
    .page-dots button {
      min-width: 34px;
      height: 34px;
      padding: 0 0.55rem;
      border-radius: 0.85rem;
      color: #71717a;
      background: rgba(255,255,255,0.035);
      border: 1px solid rgba(255,255,255,0.07);
      font-size: 0.68rem;
      font-weight: 950;
      font-family: monospace;
      transition: 0.2s ease;
    }
    .page-dots button:hover,
    .page-dots button.active {
      color: #050506;
      background: #f59e0b;
      border-color: rgba(245,158,11,0.75);
      box-shadow: 0 10px 24px rgba(245,158,11,0.14);
    }
    @media (max-width: 640px) {
      .promo-page-list {
        min-height: 620px;
      }
      .promo-pagination {
        grid-template-columns: 44px minmax(0, 1fr) 44px;
        gap: 0.5rem;
      }
      .page-nav {
        width: 44px;
        height: 44px;
      }
      .page-rail {
        flex-direction: column;
        align-items: stretch;
      }
      .page-dots {
        justify-content: flex-start;
      }
    }
  `]
})
export class AdminPromotionsComponent implements OnInit {
  private adminService = inject(AdminService);
  private productService = inject(ProductService);

  promotions = signal<any[]>([]);
  categories = signal<any[]>([]);
  products = signal<Produit[]>([]);
  readonly pageSize = 4;
  promoPage = signal(1);

  // Flagship Feedback System
  pendingDeleteAction = signal<{ id: number, name: string } | null>(null);
  activeDeleteElement: HTMLElement | null = null;
  deleteBtnPos = signal({ x: 0, y: 0 });
  windowWidth = signal(window.innerWidth);
  windowHeight = signal(window.innerHeight);
  activeToast = signal<{ message: string, type: 'success' | 'error' } | null>(null);

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

  Math = Math;
  Date = Date;

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


  targetModes = [
    { value: 'GLOBAL', label: 'Global', icon: 'globe-2' },
    { value: 'CATEGORIE', label: 'Catégorie', icon: 'layers' },
    { value: 'PRODUIT', label: 'Produit', icon: 'package-check' }
  ];

  promoForm = {
    code: '',
    pourcentage: null as number | null,
    dateFin: '',
    cibleType: 'GLOBAL',
    cibleId: null as number | null
  };

  activePromotions = computed(() => this.promotions().filter((promo) => this.isCurrentlyActive(promo)).length);
  totalPromoPages = computed(() => Math.max(1, Math.ceil(this.promotions().length / this.pageSize)));
  pageStartIndex = computed(() => (this.promoPage() - 1) * this.pageSize);
  pageEndIndex = computed(() => Math.min(this.pageStartIndex() + this.pageSize, this.promotions().length));
  paginatedPromotions = computed(() => this.promotions().slice(this.pageStartIndex(), this.pageEndIndex()));
  promoPages = computed(() => Array.from({ length: this.totalPromoPages() }, (_, index) => index + 1));
  averageDiscount = computed(() => {
    const promos = this.promotions();
    if (!promos.length) return 0;
    const total = promos.reduce((sum, promo) => sum + Number(promo.pourcentageRemise || 0), 0);
    return Math.round(total / promos.length);
  });
  nextExpirationLabel = computed(() => {
    const next = this.promotions()
      .filter((promo) => this.isCurrentlyActive(promo))
      .sort((a, b) => new Date(a.dateFin).getTime() - new Date(b.dateFin).getTime())[0];

    if (!next) return 'Aucune campagne active';
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(next.dateFin));
  });
  centerAdvice = computed(() => {
    const active = this.activePromotions();
    const average = this.averageDiscount();

    if (!this.promotions().length) return 'Créez un code court et ciblez une catégorie stratégique pour tester la demande.';
    if (active === 0) return 'Relancez une campagne ciblée: toutes les promotions sont terminées.';
    if (average >= 35) return 'Remise élevée: réservez ces codes aux stocks à écouler.';
    return 'Bon équilibre: alternez codes catégorie et produits précis pour piloter la marge.';
  });

  ngOnInit() {
    this.loadPromotions();
    this.loadTargets();
    this.generatePromoCode();
  }

  loadTargets() {
    this.adminService.getAllCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Categories error:', err)
    });

    this.productService.getProducts().subscribe({
      next: (data) => this.products.set(data),
      error: (err) => console.error('Products error:', err)
    });
  }

  loadPromotions() {
    this.adminService.getAllPromotions().subscribe({
      next: (data) => {
        this.promotions.set(data);
        this.clampPromoPage();
      },
      error: (err) => console.error('Error:', err)
    });
  }

  clampPromoPage() {
    this.promoPage.set(Math.min(Math.max(this.promoPage(), 1), this.totalPromoPages()));
  }

  goToPromoPage(page: number) {
    this.promoPage.set(Math.min(Math.max(page, 1), this.totalPromoPages()));
  }

  nextPromoPage() {
    this.goToPromoPage(this.promoPage() + 1);
  }

  previousPromoPage() {
    this.goToPromoPage(this.promoPage() - 1);
  }

  // --- Global Confirmation Logic ---
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
    this.adminService.deletePromotion(id).subscribe({
      next: () => {
        this.loadPromotions();
        this.pendingDeleteAction.set(null);
        this.showToast('Campagne retirée avec succès', 'success');
      },
      error: () => this.showToast('Erreur lors de la suppression', 'error')
    });
  }

  // --- Toast Notification System ---
  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.activeToast.set({ message, type });
    setTimeout(() => {
      this.activeToast.set(null);
    }, 3000);
  }

  generatePromoCode() {
    const prefixes = ['FLASH', 'BOOK', 'ISGA', 'ELITE', 'SMART', 'CART'];
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const discount = this.promoForm.pourcentage || [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)];
    this.promoForm.code = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${discount}-${suffix}`;
  }

  normalizeCode() {
    this.promoForm.code = (this.promoForm.code || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 18);
  }

  setTargetMode(mode: string) {
    this.promoForm.cibleType = mode;
    this.promoForm.cibleId = null;
  }

  targetLabel(): string {
    if (this.promoForm.cibleType === 'GLOBAL') return 'Tout le catalogue';
    if (this.promoForm.cibleType === 'CATEGORIE') {
      return this.categories().find((cat) => cat.id === this.promoForm.cibleId)?.nom || 'Catégorie à choisir';
    }
    return this.products().find((product) => product.id === this.promoForm.cibleId)?.nom || 'Produit à choisir';
  }

  impactLabel(): string {
    if (this.promoForm.cibleType === 'GLOBAL') return `${this.products().length || 'Tous'} produits`;
    if (this.promoForm.cibleType === 'CATEGORIE') {
      const count = this.products().filter((product) => product.categorie?.id === this.promoForm.cibleId).length;
      return `${count} produits`;
    }
    return this.promoForm.cibleId ? '1 produit' : 'En attente';
  }

  launchBrief(): string {
    const code = this.promoForm.code || 'votre code';
    const discount = this.promoForm.pourcentage || 0;
    return `${code} appliquera ${discount}% sur ${this.targetLabel().toLowerCase()}. Utilisez une durée courte pour créer de l'urgence sans casser la marge.`;
  }

  canLaunch(): boolean {
    const hasTarget = this.promoForm.cibleType === 'GLOBAL' || !!this.promoForm.cibleId;
    return !!this.promoForm.code && !!this.promoForm.pourcentage && !!this.promoForm.dateFin && hasTarget;
  }

  launchPromotion() {
    if (!this.canLaunch()) return;

    this.adminService.lancerPromotionGlobale(Number(this.promoForm.pourcentage), this.promoForm.dateFin, {
      code: this.promoForm.code,
      cibleType: this.promoForm.cibleType,
      cibleId: this.promoForm.cibleId
    }).subscribe({
      next: () => {
        this.loadPromotions();
        this.promoForm = { code: '', pourcentage: null, dateFin: '', cibleType: 'GLOBAL', cibleId: null };
        this.generatePromoCode();
        this.showToast('Campagne lancée et propagée', 'success');
      },
      error: (err) => this.showToast('Échec du lancement', 'error')
    });
  }

  toggleStatus(id: number) {
    this.adminService.togglePromotionStatus(id).subscribe({
      next: () => {
        this.loadPromotions();
        this.showToast('Statut de la campagne synchronisé', 'success');
      },
      error: (err) => this.showToast('Erreur de synchronisation', 'error')
    });
  }

  deletePromotion(id: number) {
    // Handled by executeDelete
  }

  isCurrentlyActive(promo: any): boolean {
    return promo.active && this.isActive(promo.dateFin);
  }

  isActive(dateFin: string): boolean {
    if (!dateFin) return false;
    return new Date(dateFin) > new Date();
  }

  daysRemaining(dateFin: string): string {
    if (!this.isActive(dateFin)) return '0 jour';
    const end = new Date(dateFin).getTime();
    const today = new Date().getTime();
    const days = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return days > 1 ? `${days} jours` : '1 jour';
  }
}
