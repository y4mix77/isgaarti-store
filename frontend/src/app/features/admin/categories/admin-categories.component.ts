import { Component, OnInit, signal, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-categories',
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
              <lucide-icon name="arrow-left" class="w-4 h-4 text-blue-500 group-hover:-translate-x-1 transition-transform"></lucide-icon>
              <span class="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white">Retour au Dashboard</span>
            </a>

            <!-- Alignment Badge -->
            <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-[0.22em] shadow-[0_0_24px_rgba(59,130,246,0.14)] animate-in slide-in-from-right-10 duration-1000">
              <lucide-icon name="layers" class="w-3 h-3"></lucide-icon>
              Taxonomy Control Centre
            </div>
          </div>

          <div class="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-8">
            <div class="relative max-w-4xl">
              <h1 class="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] mb-5">
                STRUCTURE
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-white to-zinc-700">CATALOGUE</span>
              </h1>
              <p class="max-w-2xl text-zinc-400 font-semibold text-sm md:text-base leading-7 border-l-2 border-blue-500/30 pl-5">
                Organisez les segments du catalogue, complétez les descriptions et gardez une lecture rapide de la santé de votre taxonomie.
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- Full-Width System Intelligence Panel -->
      <div class="max-w-[1500px] mx-auto px-5 sm:px-8 mb-20">
        <div class="relative p-1 rounded-[32px] bg-gradient-to-br from-white/10 to-transparent border border-white/5 shadow-2xl overflow-hidden">
          <div class="absolute inset-0 bg-zinc-950/80 backdrop-blur-3xl"></div>
          
          <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/5">
            <div class="p-8 group hover:bg-white/[0.02] transition-colors">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <lucide-icon name="layers" class="w-4 h-4"></lucide-icon>
                </div>
                <span class="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Architecture</span>
              </div>
              <div class="text-4xl font-black text-white tracking-tighter mb-1">{{ categories().length }}</div>
              <p class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Segments Master</p>
              <div class="mt-4 flex items-center gap-2">
                <div class="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
                <span class="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Intégrité Système 100%</span>
              </div>
            </div>

            <div class="p-8 group hover:bg-white/[0.02] transition-colors">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                  <lucide-icon name="book-open" class="w-4 h-4"></lucide-icon>
                </div>
                <span class="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Documentation</span>
              </div>
              <div class="text-4xl font-black text-green-500 tracking-tighter mb-1">{{ describedCategories() }}</div>
              <p class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Entrées Détaillées</p>
              <div class="mt-4 w-full h-1 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                <div class="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000" [style.width.%]="completionRate()"></div>
              </div>
            </div>

            <div class="p-8 group hover:bg-white/[0.02] transition-colors">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center text-blue-400">
                  <lucide-icon name="activity" class="w-4 h-4"></lucide-icon>
                </div>
                <span class="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Santé Taxonomie</span>
              </div>
              <div class="text-4xl font-black text-blue-400 tracking-tighter mb-1">{{ completionRate() }}<span class="text-xl text-zinc-700">%</span></div>
              <p class="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Score de Complétion</p>
              <p class="mt-3 text-[9px] font-black text-blue-500/60 uppercase tracking-widest italic animate-pulse">Analyse en temps réel...</p>
            </div>

            <div class="p-8 group hover:bg-white/[0.02] transition-colors relative overflow-hidden">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <lucide-icon name="history" class="w-4 h-4"></lucide-icon>
                </div>
                <span class="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Flux d'Opérations</span>
              </div>
              <div class="space-y-3">
                @for (operation of categoryOperations(); track operation.id) {
                  <div class="flex items-start gap-3">
                    <div class="w-1 h-1 rounded-full mt-1.5" [ngClass]="operation.color"></div>
                    <div>
                      <p class="text-[10px] font-bold text-zinc-300 leading-none">{{ operation.label }}</p>
                      <p class="text-[8px] font-black text-zinc-600 uppercase mt-1">{{ operation.time }}</p>
                    </div>
                  </div>
                } @empty {
                  <div class="flex items-start gap-3">
                    <div class="w-1 h-1 rounded-full bg-zinc-700 mt-1.5"></div>
                    <div>
                      <p class="text-[10px] font-bold text-zinc-500 leading-none">Aucune opération catégorie</p>
                      <p class="text-[8px] font-black text-zinc-700 uppercase mt-1">En attente</p>
                    </div>
                  </div>
                }
              </div>
              <div class="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <lucide-icon name="shield-check" class="w-12 h-12"></lucide-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-[1500px] mx-auto px-5 sm:px-8">
        <!-- Flagship Enterprise Table -->
        <div class="relative rounded-[32px] border border-white/5 bg-zinc-900/10 backdrop-blur-3xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.4)]">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-white/5 bg-white/[0.02]">
                  <th class="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] w-32">S-ID</th>
                  <th class="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Identité & Namespace</th>
                  <th class="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Spécification</th>
                  <th class="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Priorité</th>
                  <th class="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-right">Contrôle Système</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.02]">
                @if (isAddingCategory()) {
                  <tr class="bg-blue-500/[0.04] border-y border-blue-500/20">
                    <td class="px-8 py-8">
                      <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_24px_rgba(59,130,246,0.18)]">
                        <lucide-icon name="plus" class="w-5 h-5"></lucide-icon>
                      </div>
                    </td>
                    <td class="px-8 py-8">
                      <input
                        type="text"
                        [(ngModel)]="catDraft.nom"
                        placeholder="Titre de la catégorie"
                        class="w-full bg-zinc-950/70 border border-blue-500/20 px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-black text-sm uppercase tracking-tight placeholder:text-zinc-700"
                      />
                    </td>
                    <td class="px-8 py-8 max-w-lg">
                      <textarea
                        [(ngModel)]="catDraft.description"
                        rows="2"
                        placeholder="Description de la catégorie"
                        class="w-full bg-zinc-950/70 border border-blue-500/20 px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium text-sm resize-none placeholder:text-zinc-700"
                      ></textarea>
                    </td>
                    <td class="px-8 py-8">
                      <span class="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-[8px] font-black text-blue-300 uppercase tracking-[0.18em]">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                        Ajout
                      </span>
                    </td>
                    <td class="px-8 py-8">
                      <div class="flex items-center justify-end gap-3">
                        <button (click)="validateAddCategory()" [disabled]="!catDraft.nom.trim()" class="w-10 h-10 rounded-xl bg-blue-600 border border-blue-400/30 text-white hover:bg-blue-500 transition-all flex items-center justify-center shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed">
                          <lucide-icon name="check" class="w-4 h-4"></lucide-icon>
                        </button>
                        <button (click)="cancelInlineMode()" class="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center shadow-2xl">
                          <lucide-icon name="x" class="w-4 h-4"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
                @for (cat of categories(); track cat.id) {
                  <tr class="group hover:bg-white/[0.03] transition-all duration-300" [class.inline-edit-row]="isEditingCategory(cat.id)">
                    <td class="px-8 py-10 relative overflow-hidden">
                      <!-- Flagship ID Watermark -->
                      <div class="absolute -left-2 top-1/2 -translate-y-1/2 text-7xl font-black text-white/[0.03] group-hover:text-blue-500/[0.06] transition-all duration-700 pointer-events-none select-none italic tracking-tighter">
                        {{ cat.id < 10 ? '0' + cat.id : cat.id }}
                      </div>
                      <div class="relative z-10 w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 flex flex-col items-center justify-center shadow-2xl group-hover:border-blue-500/30 transition-all">
                        <span class="text-[12px] font-black text-white leading-none">{{ cat.id }}</span>
                        <span class="text-[7px] font-black text-zinc-600 uppercase mt-0.5 tracking-tighter">HEX-ID</span>
                      </div>
                    </td>
                    <td class="px-8 py-10">
                      <div class="flex items-center gap-5">
                        <div class="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 transition-all shadow-lg relative overflow-hidden">
                          <lucide-icon name="layers" class="w-6 h-6 relative z-10"></lucide-icon>
                          <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div>
                          @if (isEditingCategory(cat.id)) {
                            <input
                              type="text"
                              [(ngModel)]="catDraft.nom"
                              class="w-full min-w-[240px] bg-zinc-950/70 border border-blue-500/20 px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-black text-sm uppercase tracking-tight"
                            />
                          } @else {
                            <p class="text-base font-black text-white uppercase tracking-tighter group-hover:text-blue-400 transition-colors leading-none">{{ cat.nom }}</p>
                            <div class="flex items-center gap-2 mt-2">
                              <span class="text-[8px] font-black text-zinc-500 uppercase tracking-widest bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/5">PATH: root/catalog/{{ cat.nom.toLowerCase() }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="px-8 py-10 max-w-lg">
                      @if (isEditingCategory(cat.id)) {
                        <textarea
                          [(ngModel)]="catDraft.description"
                          rows="2"
                          class="w-full bg-zinc-950/70 border border-blue-500/20 px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium text-sm resize-none"
                        ></textarea>
                      } @else {
                        <div class="p-3 rounded-xl bg-zinc-950/40 border border-white/5">
                          <p class="text-[11px] font-bold text-zinc-400 leading-5 line-clamp-2 italic group-hover:text-zinc-200 transition-colors">
                            {{ cat.description || 'Définition technique manquante. Cliquez sur modifier pour enrichir ce segment.' }}
                          </p>
                        </div>
                      }
                    </td>
                    <td class="px-8 py-10">
                      <div class="flex flex-col gap-2">
                        <div class="flex justify-between items-center text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                          <span>Charge</span>
                          <span class="text-blue-500">22%</span>
                        </div>
                        <div class="w-24 h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                          <div class="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] w-[22%]"></div>
                        </div>
                      </div>
                    </td>
                    <td class="px-8 py-10 relative">
                      <div class="flex items-center justify-end gap-3 transition-all scale-95 group-hover:scale-100" [ngClass]="isEditingCategory(cat.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'">
                        @if (isEditingCategory(cat.id)) {
                          <button (click)="validateEditCategory(cat.id)" [disabled]="!catDraft.nom.trim()" class="w-10 h-10 rounded-xl bg-blue-600 border border-blue-400/30 text-white hover:bg-blue-500 transition-all flex items-center justify-center shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed">
                            <lucide-icon name="check" class="w-4 h-4"></lucide-icon>
                          </button>
                          <button (click)="cancelInlineMode()" class="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center shadow-2xl">
                            <lucide-icon name="x" class="w-4 h-4"></lucide-icon>
                          </button>
                        } @else {
                          <button (click)="startEditMode(cat)" class="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all flex items-center justify-center shadow-2xl group/btn">
                            <lucide-icon name="pencil" class="w-4 h-4 group-hover/btn:scale-110 transition-transform"></lucide-icon>
                          </button>
                          
                          <button (click)="triggerDeleteConfirm(cat.id, cat.nom, $event)" 
                                  [ngClass]="{'bg-red-600 border-red-500 text-white opacity-100': pendingDeleteAction()?.id === cat.id}"
                                  class="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white hover:bg-red-600 hover:border-red-500 transition-all flex items-center justify-center shadow-2xl group/btn">
                            <lucide-icon name="trash-2" class="w-4 h-4 group-hover/btn:scale-110 transition-transform"></lucide-icon>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-8 py-32 text-center bg-zinc-900/10">
                      <lucide-icon name="layers" class="w-20 h-20 text-zinc-800 mx-auto mb-6 opacity-20 animate-bounce"></lucide-icon>
                      <h3 class="text-2xl font-black text-zinc-700 uppercase tracking-[0.3em]">Taxonomie Archive Vide</h3>
                      <p class="text-[10px] font-bold text-zinc-800 uppercase tracking-[0.1em] mt-2">Initialisez votre structure via le centre de contrôle flottant</p>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Flagship Neural Action Link (Filament & Orb) -->
    @if (pendingDeleteAction(); as action) {
      <!-- Electric Filament -->
      <svg class="fixed inset-0 z-[990] pointer-events-none w-full h-full">
        <defs>
          <linearGradient id="electricGradientCat" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ef4444" stop-opacity="0" />
            <stop offset="50%" stop-color="#ef4444" stop-opacity="0.8">
              <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stop-color="#ef4444" stop-opacity="0" />
          </linearGradient>
          <filter id="glowCat">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path 
          [attr.d]="filamentPath()"
          fill="none" 
          stroke="url(#electricGradientCat)" 
          stroke-width="3" 
          filter="url(#glowCat)"
          class="animate-filament"
        />
        <circle [attr.cx]="deleteBtnPos().x" [attr.cy]="deleteBtnPos().y" r="4" fill="#ef4444" class="animate-ping" />
      </svg>

      <!-- Floating Confirmation Orb (Smaller & High Density) -->
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
              <h4 class="text-[7px] font-black text-zinc-500 uppercase tracking-[0.25em] mb-1">Suppression</h4>
              <h2 class="text-lg font-black text-white uppercase tracking-tighter leading-tight mb-1">Détruire <span class="text-red-500 italic">"{{ action.name }}"</span> ?</h2>
              <p class="text-[9px] font-bold text-zinc-400 leading-tight">Action irréversible. Déconnexion Master Catalog.</p>
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
      <div class="fixed bottom-10 right-10 z-[1000] h-10 px-4 bg-zinc-950/85 backdrop-blur-2xl border rounded-xl shadow-[0_18px_45px_rgba(0,0,0,0.45)] flex items-center gap-3 animate-in slide-in-from-right-6 duration-300 overflow-hidden"
           [ngClass]="toast.type === 'success' ? 'border-blue-500/25 text-blue-200' : 'border-red-500/25 text-red-200'">
        <div class="absolute left-0 top-0 h-full w-[2px]" [ngClass]="toast.type === 'success' ? 'bg-blue-400' : 'bg-red-400'"></div>
        <span class="w-1.5 h-1.5 rounded-full animate-pulse" [ngClass]="toast.type === 'success' ? 'bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]' : 'bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]'"></span>
        <p class="text-[10px] font-black uppercase tracking-[0.18em] leading-none whitespace-nowrap">{{ toast.message }}</p>
        <button (click)="activeToast.set(null)" class="text-zinc-600 hover:text-white transition-colors">
          <lucide-icon name="x" class="w-3.5 h-3.5"></lucide-icon>
        </button>
      </div>
    }


      <!-- Flagship Floating Action Button (Refined) -->
      <button (click)="startAddMode()" class="fixed bottom-10 right-10 z-[90] w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-[0_15px_40px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:scale-110 hover:rounded-[24px] active:scale-95 transition-all duration-500 group overflow-hidden border-2 border-white/10 backdrop-blur-xl">
        <div class="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <lucide-icon name="plus" class="w-6 h-6 relative z-10 transition-transform duration-500 group-hover:rotate-90"></lucide-icon>
        <div class="absolute -inset-1 bg-blue-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>

    @if (isModalOpen()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-3xl" (click)="closeModal()"></div>

        <div class="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_100px_300px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-95 duration-700">
          <div class="p-8">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-3xl font-black text-white tracking-tight leading-none uppercase">
                  {{ editingCat() ? 'Modifier' : 'Créer' }}
                  <span class="text-blue-500">segment</span>
                </h2>
                <p class="text-[9px] font-black text-zinc-600 uppercase tracking-[0.18em] mt-2">Architecture catalogue</p>
              </div>
              <div class="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-2xl relative overflow-hidden">
                <lucide-icon [name]="editingCat() ? 'edit-3' : 'plus'" class="w-7 h-7 relative z-10"></lucide-icon>
              </div>
            </div>

            <div class="space-y-5">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-zinc-600 uppercase tracking-[0.18em]">Nom du segment</label>
                <input
                  type="text"
                  [(ngModel)]="catForm.nom"
                  placeholder="Ex: Programmation"
                  class="w-full bg-zinc-900/50 border border-white/10 px-5 py-3.5 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all font-black text-lg tracking-tight placeholder:text-zinc-700"
                />
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black text-zinc-600 uppercase tracking-[0.18em]">Description</label>
                <textarea
                  [(ngModel)]="catForm.description"
                  rows="4"
                  placeholder="Décrivez brièvement le contenu de ce segment..."
                  class="w-full bg-zinc-900/50 border border-white/10 px-5 py-3.5 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all font-medium text-sm resize-none placeholder:text-zinc-700"
                ></textarea>
              </div>
            </div>

            <div class="flex gap-3 mt-8">
              <button (click)="closeModal()" class="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-zinc-500 uppercase tracking-[0.16em] hover:bg-white/10 transition-all">
                Annuler
              </button>
              <button (click)="saveCategorie()" [disabled]="!catForm.nom" class="flex-1 h-12 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.16em] shadow-[0_16px_35px_rgba(37,99,235,0.22)] hover:bg-blue-500 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed">
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .inline-edit-row {
      background: rgba(59, 130, 246, 0.04);
      box-shadow: inset 0 1px 0 rgba(59, 130, 246, 0.16), inset 0 -1px 0 rgba(59, 130, 246, 0.16);
    }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  private adminService = inject(AdminService);

  categories = signal<any[]>([]);
  isModalOpen = signal(false);
  editingCat = signal<any | null>(null);
  isAddingCategory = signal(false);
  editingCategoryId = signal<number | null>(null);

  // Flagship Feedback System
  pendingDeleteAction = signal<{ id: number, name: string } | null>(null);
  activeDeleteElement: HTMLElement | null = null;
  deleteBtnPos = signal({ x: 0, y: 0 });
  windowWidth = signal(window.innerWidth);
  windowHeight = signal(window.innerHeight);
  activeToast = signal<{ message: string, type: 'success' | 'error' } | null>(null);
  categoryOperations = signal<Array<{ id: number, label: string, time: string, color: string }>>([]);

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


  describedCategories = computed(() => this.categories().filter(cat => !!cat.description?.trim()).length);
  completionRate = computed(() => {
    const total = this.categories().length;
    if (!total) return 0;
    return Math.round((this.describedCategories() / total) * 100);
  });
  centerAdvice = computed(() => {
    const total = this.categories().length;
    const completion = this.completionRate();

    if (!total) return 'Créez quelques segments clairs pour structurer les produits.';
    if (completion < 50) return 'Ajoutez des descriptions: elles rendent le catalogue plus lisible.';
    if (total < 4) return 'Ajoutez plus de segments pour faciliter la navigation.';
    return 'Structure propre: gardez les noms courts et les descriptions utiles.';
  });

  catForm = {
    nom: '',
    description: ''
  };

  catDraft = {
    nom: '',
    description: ''
  };

  ngOnInit() {
    this.loadCategoryOperations();
    this.loadCategories();
  }

  loadCategories() {
    this.adminService.getAllCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Error:', err)
    });
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
    const categoryName = this.categories().find(category => category.id === id)?.nom || `ID ${id}`;

    this.adminService.deleteCategorie(id).subscribe({
      next: () => {
        this.loadCategories();
        this.prependLocalCategoryOperation('DELETE', categoryName);
        this.refreshCategoryOperations();
        this.pendingDeleteAction.set(null);
        this.showToast('Segment supprimé avec succès', 'success');
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

  openCreateModal() {
    this.startAddMode();
  }

  openEditModal(cat: any) {
    this.startEditMode(cat);
  }

  closeModal() { this.isModalOpen.set(false); }

  deleteCategorie(id: number) {
    // Handled by executeDelete
  }

  saveCategorie() {
    if (this.editingCat()) {
      this.adminService.updateCategorie(this.editingCat().id, this.catForm).subscribe({
        next: () => {
          this.loadCategories();
          this.prependLocalCategoryOperation('EDIT', this.catForm.nom);
          this.refreshCategoryOperations();
          this.closeModal();
          this.showToast('Architecture mise à jour', 'success');
        },
        error: () => this.showToast('Erreur de mise à jour', 'error')
      });
    } else {
      this.adminService.creerCategorie(this.catForm).subscribe({
        next: () => {
          this.loadCategories();
          this.prependLocalCategoryOperation('CREATE', this.catForm.nom);
          this.refreshCategoryOperations();
          this.closeModal();
          this.showToast('Nouveau segment initialisé', 'success');
        },
        error: () => this.showToast('Erreur de création', 'error')
      });
    }
  }

  startAddMode() {
    this.pendingDeleteAction.set(null);
    this.editingCat.set(null);
    this.editingCategoryId.set(null);
    this.isAddingCategory.set(true);
    this.catDraft = { nom: '', description: '' };
    this.showToast('Adding mode : on', 'success');
  }

  startEditMode(cat: any) {
    this.pendingDeleteAction.set(null);
    this.isAddingCategory.set(false);
    this.editingCat.set(cat);
    this.editingCategoryId.set(cat.id);
    this.catDraft = { nom: cat.nom || '', description: cat.description || '' };
    this.showToast('Edit mode : on', 'success');
  }

  isEditingCategory(id: number) {
    return this.editingCategoryId() === id;
  }

  cancelInlineMode() {
    this.isAddingCategory.set(false);
    this.editingCat.set(null);
    this.editingCategoryId.set(null);
    this.catDraft = { nom: '', description: '' };
  }

  validateAddCategory() {
    if (!this.catDraft.nom.trim()) return;

    const draft = this.cleanDraft();
    this.adminService.creerCategorie(draft).subscribe({
      next: (createdCategory) => {
        this.categories.update(categories => [createdCategory, ...categories]);
        this.prependLocalCategoryOperation('CREATE', draft.nom);
        this.refreshCategoryOperations();
        this.cancelInlineMode();
        this.showToast('Catégorie ajoutée avec succès', 'success');
      },
      error: () => this.showToast('Erreur de création', 'error')
    });
  }

  validateEditCategory(id: number) {
    if (!this.catDraft.nom.trim()) return;

    const draft = this.cleanDraft();
    this.adminService.updateCategorie(id, draft).subscribe({
      next: (updatedCategory) => {
        this.categories.update(categories => categories.map(category => (
          category.id === id ? { ...category, ...updatedCategory, ...draft } : category
        )));
        this.prependLocalCategoryOperation('EDIT', draft.nom);
        this.refreshCategoryOperations();
        this.cancelInlineMode();
        this.showToast('Modifications enregistrées avec succès', 'success');
      },
      error: () => this.showToast('Erreur de mise à jour', 'error')
    });
  }

  private cleanDraft() {
    return {
      nom: this.catDraft.nom.trim(),
      description: this.catDraft.description.trim()
    };
  }

  private loadCategoryOperations() {
    this.adminService.getCategorieOperations().subscribe({
      next: (operations) => {
        this.categoryOperations.set(operations.map(operation => ({
          id: operation.id,
          label: `${operation.action} catégorie "${operation.categorieNom}"`,
          time: this.formatOperationTime(operation.createdAt),
          color: this.operationColor(operation.action)
        })));
      },
      error: (err) => console.error('Category operations fetch failed:', err)
    });
  }

  private refreshCategoryOperations() {
    setTimeout(() => this.loadCategoryOperations(), 250);
  }

  private prependLocalCategoryOperation(action: string, categoryName: string) {
    const operation = {
      id: Date.now(),
      label: `${action} catégorie "${categoryName}"`,
      time: 'Maintenant',
      color: this.operationColor(action)
    };
    this.categoryOperations.update(operations => [operation, ...operations].slice(0, 8));
  }

  private operationColor(action: string) {
    if (action === 'CREATE') return 'bg-blue-500';
    if (action === 'EDIT') return 'bg-green-500';
    if (action === 'DELETE') return 'bg-red-500';
    return 'bg-zinc-700';
  }

  private formatOperationTime(createdAt: string | null) {
    if (!createdAt) return 'Maintenant';

    return new Date(createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
