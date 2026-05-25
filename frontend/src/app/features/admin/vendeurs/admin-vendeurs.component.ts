import { Component, OnInit, signal, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-vendeurs',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, RouterLink],
  template: `
    <div class="bg-glow" style="--glow-color: rgba(245, 158, 11, 0.1)"></div>
    <div class="bg-grid">
      <div class="bg-grid-inner"></div>
    </div>

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
              <lucide-icon name="shield-check" class="w-3 h-3"></lucide-icon>
              Identity Governance Centre
            </div>
          </div>

          <div class="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-8">
            <div class="relative max-w-4xl">
              <h1 class="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] mb-5">
                GOUVERNANCE
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-white to-zinc-700 uppercase">Vendeurs</span>
              </h1>
              <p class="max-w-2xl text-zinc-400 font-semibold text-sm md:text-base leading-7 border-l-2 border-amber-500/30 pl-5">
                Pilotez le cycle de vie des identités. Approuvez les nouveaux partenaires via la file d'attente et gérez les privilèges système en temps réel.
              </p>
            </div>

            <div class="flex items-stretch gap-3 w-full xl:w-[440px]">
              <div class="flex-1 p-5 rounded-2xl bg-zinc-900/45 border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
                <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-amber-500">
                  <lucide-icon name="users" class="w-24 h-24"></lucide-icon>
                </div>
                <p class="text-[10px] font-black text-zinc-600 uppercase tracking-[0.18em] mb-3">Membres</p>
                <div class="flex items-baseline gap-3">
                  <span class="text-4xl font-black font-mono tracking-tight">{{ users().length }}</span>
                  <lucide-icon name="trending-up" class="w-5 h-5 text-green-600"></lucide-icon>
                </div>
              </div>
              <div class="flex-1 p-5 rounded-2xl bg-zinc-900/45 border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
                <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-amber-500">
                  <lucide-icon name="store" class="w-24 h-24"></lucide-icon>
                </div>
                @if (pendingUsers().length > 0) {
                  <button type="button" (click)="isDrawerOpen.set(true)" class="vendor-request-badge" title="Demandes vendeurs en attente">
                    <span>{{ pendingUsers().length }}</span>
                    <lucide-icon name="bell" class="w-3.5 h-3.5"></lucide-icon>
                  </button>
                }
                <p class="text-[10px] font-black text-zinc-600 uppercase tracking-[0.18em] mb-3">Vendeurs</p>
                <div class="flex items-baseline gap-3">
                  <span class="text-4xl font-black font-mono tracking-tight">{{ vendorCount() }}</span>
                  <lucide-icon name="trending-up" class="w-5 h-5 text-green-600"></lucide-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-[1500px] mx-auto px-5 sm:px-8">
        <div class="flex flex-col lg:flex-row gap-3 mb-6">
          <div class="relative flex-1 group">
            <div class="absolute inset-y-0 left-4 flex items-center">
              <lucide-icon name="search" class="w-5 h-5 text-zinc-600 group-focus-within:text-amber-500 transition-colors"></lucide-icon>
            </div>
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Rechercher un membre..."
              class="w-full h-14 bg-zinc-900/50 border border-white/10 pl-12 pr-5 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all font-bold text-sm placeholder:text-zinc-600 shadow-inner"
            />
          </div>
          <div class="flex gap-3">
            <button (click)="isDrawerOpen.set(true)" class="approval-toolbar-icon" title="File d'approbation vendeurs">
              <lucide-icon name="inbox" class="w-5 h-5"></lucide-icon>
              @if (pendingUsers().length > 0) {
                <span>{{ pendingUsers().length }}</span>
              }
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          @for (user of filteredUsers(); track user.id) {
            <div class="group relative p-8 pl-10 pt-12 rounded-[32px] border border-white/5 bg-zinc-900/10 backdrop-blur-3xl hover:bg-white/[0.04] hover:border-amber-500/40 transition-all duration-700 shadow-2xl overflow-hidden">
              <!-- Flagship Corner Role Badges -->
              <div class="absolute -top-1 -left-1 z-30 flex gap-[-5px]">
                @for (role of user.roles; track role.id) {
                  <div [ngClass]="getRoleBadgeClass(role.name)" class="w-14 h-14 rounded-br-3xl rounded-tl-[32px] border-2 border-zinc-950 flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 group/role relative overflow-hidden">
                    <div class="absolute inset-0 bg-white/5 opacity-0 group-hover/role:opacity-100 transition-opacity"></div>
                    <lucide-icon [name]="getRoleIcon(role.name)" class="w-6 h-6 relative z-10"></lucide-icon>
                    
                    <!-- Decorative corner glow -->
                    <div class="absolute top-0 left-0 w-4 h-4 bg-white/20 blur-sm rounded-full"></div>
                  </div>
                }
              </div>

              <!-- Authority Edge Bar (Subtle) -->
              <div class="absolute left-0 top-14 bottom-14 w-1 bg-amber-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

              <!-- Flagship ID Watermark -->
              <div class="absolute -right-4 top-1/2 -translate-y-1/2 text-[10rem] font-black text-white/[0.02] pointer-events-none group-hover:text-amber-500/[0.04] transition-all duration-1000 select-none rotate-90 xl:rotate-0 uppercase tracking-tighter">
                {{ user.id < 10 ? '0' + user.id : user.id }}
              </div>

              <!-- Top Section: Identity & Actions -->
              <div class="relative z-10 flex items-start justify-between mb-10">
                <div class="flex items-center gap-5">
                  <div class="relative flex items-center justify-center">
                    <lucide-icon name="user" class="w-12 h-12 text-zinc-500 group-hover:text-amber-500 transition-all duration-700"></lucide-icon>
                    <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-950 border-2 border-zinc-950 flex items-center justify-center">
                      <div class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,1)] animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <h3 class="text-2xl font-black text-white tracking-tighter leading-none group-hover:text-amber-400 transition-colors uppercase">{{ user.nom }}</h3>
                    <div class="flex items-center gap-2 mt-2">
                      <span class="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/5">ID: {{ user.id }}</span>
                      <span class="w-1 h-1 rounded-full bg-zinc-700"></span>
                      <span class="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Opérateur Vérifié</span>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-[-10px] group-hover:translate-y-0">
                  <button (click)="triggerRoleConfirm(user, $event)" 
                          [ngClass]="{'bg-amber-500 border-amber-400 text-black opacity-100': pendingRoleAction()?.id === user.id}"
                          class="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 text-zinc-500 hover:text-amber-500 hover:border-amber-500/40 transition-all flex items-center justify-center shadow-2xl backdrop-blur-xl">
                    <lucide-icon name="shield" class="w-4 h-4"></lucide-icon>
                  </button>
                  
                  <button (click)="triggerDeleteConfirm(user.id, user.nom, $event)" 
                          [ngClass]="{'bg-red-600 border-red-500 text-white opacity-100': pendingDeleteAction()?.id === user.id}"
                          class="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 text-zinc-500 hover:text-red-500 hover:border-red-500/40 transition-all flex items-center justify-center shadow-2xl backdrop-blur-xl">
                    <lucide-icon name="trash-2" class="w-4 h-4"></lucide-icon>
                  </button>
                </div>
              </div>

              <!-- Middle Section: Detailed Information -->
              <div class="relative z-10 space-y-6 mb-10">
                <div class="flex flex-col">
                  <span class="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2 ml-1">Communication Channel</span>
                  <div class="p-4 rounded-2xl bg-zinc-950/50 border border-white/5 flex items-center gap-3 group/mail hover:border-amber-500/20 transition-all">
                    <div class="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 group-hover/mail:text-amber-500 transition-colors">
                      <lucide-icon name="mail" class="w-4 h-4"></lucide-icon>
                    </div>
                    <span class="text-xs font-bold text-zinc-400 group-hover/mail:text-zinc-200 transition-colors truncate">{{ user.email }}</span>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="p-4 rounded-2xl bg-zinc-950/50 border border-white/5">
                    <span class="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em] block mb-2">Auth Layer</span>
                    <div class="flex items-center gap-2">
                      <lucide-icon name="key-round" class="w-3.5 h-3.5 text-amber-500/60"></lucide-icon>
                      <span class="text-[10px] font-black text-zinc-300 uppercase">Chiffrée</span>
                    </div>
                  </div>
                  <div class="p-4 rounded-2xl bg-zinc-950/50 border border-white/5">
                    <span class="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em] block mb-2">System Status</span>
                    <div class="flex items-center gap-2">
                      <lucide-icon name="activity" class="w-3.5 h-3.5 text-green-500/60"></lucide-icon>
                      <span class="text-[10px] font-black text-zinc-300 uppercase">Actif</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Hover Decorative Element -->
              <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            </div>
          } @empty {
            <div class="col-span-full py-32 text-center rounded-3xl border border-dashed border-white/5 bg-zinc-900/10 backdrop-blur-xl">
              <lucide-icon name="users-2" class="w-20 h-20 text-zinc-800 mx-auto mb-6 opacity-20"></lucide-icon>
              <h3 class="text-2xl font-black text-zinc-700 uppercase tracking-[0.2em]">Registre Vide</h3>
              <p class="text-xs font-bold text-zinc-800 uppercase tracking-[0.1em] mt-2">Aucun membre ne correspond à votre recherche</p>
            </div>
          }
        </div>
      </div>

      <!-- Flagship Neural Action Link (Filament & Orb) -->
      @if (pendingDeleteAction(); as action) {
        <!-- Electric Filament -->
        <svg class="fixed inset-0 z-[990] pointer-events-none w-full h-full">
          <defs>
            <linearGradient id="electricGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ef4444" stop-opacity="0" />
              <stop offset="50%" stop-color="#ef4444" stop-opacity="0.8">
                <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stop-color="#ef4444" stop-opacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path 
            [attr.d]="filamentPath()"
            fill="none" 
            stroke="url(#electricGradient)" 
            stroke-width="3" 
            filter="url(#glow)"
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
              <h4 class="text-[7px] font-black text-zinc-500 uppercase tracking-[0.25em] mb-1">Révocation</h4>
              <h2 class="text-lg font-black text-white uppercase tracking-tighter leading-tight mb-1">Révoquer <span class="text-red-500 italic">"{{ action.name }}"</span> ?</h2>
              <p class="text-[9px] font-bold text-zinc-400 leading-tight">Action irréversible. Désactivation immédiate.</p>
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

      @if (pendingRoleAction(); as action) {
        <!-- Electric Filament -->
        <svg class="fixed inset-0 z-[990] pointer-events-none w-full h-full">
          <defs>
            <linearGradient id="electricGradientRole" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#f59e0b" stop-opacity="0" />
              <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.85">
                <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
            </linearGradient>
            <filter id="glowRole">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path 
            [attr.d]="filamentPath()"
            fill="none" 
            stroke="url(#electricGradientRole)" 
            stroke-width="3" 
            filter="url(#glowRole)"
            class="animate-filament"
          />
        </svg>

        <!-- Flagship Enterprise Role Module -->
        <div class="fixed z-[1000] w-[300px] animate-in fade-in zoom-in-95 slide-in-from-right-10 duration-500" [style.left.px]="alertLeft()" [style.top.px]="alertTop()">
          <div class="bg-zinc-950/95 backdrop-blur-3xl border border-amber-500/30 rounded-[1.5rem] p-5 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-60"></div>
            <div class="absolute top-0 left-0 w-full h-[2px] bg-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <div class="h-full bg-amber-400 animate-scan"></div>
            </div>

            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                  <lucide-icon name="shield" class="w-5 h-5"></lucide-icon>
                </div>
                <div class="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
                  <div class="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></div>
                  <span class="text-[7px] font-black text-amber-500 uppercase tracking-[0.15em]">Role</span>
                </div>
              </div>

              <div class="mb-4">
                <h4 class="text-[7px] font-black text-zinc-500 uppercase tracking-[0.25em] mb-1">Privilèges</h4>
                <h2 class="text-lg font-black text-white uppercase tracking-tighter leading-tight mb-1">Changer <span class="text-amber-500 italic">"{{ action.name }}"</span></h2>
                <p class="text-[9px] font-bold text-zinc-400 leading-tight">Sélectionnez un rôle puis validez.</p>
              </div>

              <div class="space-y-2 mb-4">
                @for (role of availableRoles; track role) {
                  <button
                    (click)="tempRole.set(role)"
                    [ngClass]="tempRole() === role ? 'border-amber-500/40 bg-amber-500/10 text-white' : 'border-white/5 bg-white/[0.03] text-zinc-500'"
                    class="w-full h-11 rounded-xl border px-3 flex items-center justify-between transition-all hover:bg-white/10"
                  >
                    <span class="flex items-center gap-3">
                      <span [ngClass]="getRoleDotClass(role)" class="w-2 h-2 rounded-full"></span>
                      <span class="text-[10px] font-black uppercase tracking-[0.15em]">{{ role }}</span>
                    </span>
                    @if (tempRole() === role) {
                      <lucide-icon name="check" class="w-4 h-4 text-amber-500"></lucide-icon>
                    }
                  </button>
                }
              </div>

              <div class="flex flex-col gap-2">
                <button (click)="saveRole()" class="w-full h-11 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.15em] shadow-[0_12px_25px_rgba(245,158,11,0.2)] hover:bg-amber-400 transition-all flex items-center justify-center gap-2">
                  <lucide-icon name="check" class="w-3.5 h-3.5"></lucide-icon>
                  Valider
                </button>
                <button (click)="pendingRoleAction.set(null)" class="w-full h-11 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:bg-white/10 transition-all">
                  Annuler
                </button>
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

    <!-- PENDING APPROVALS DRAWER -->
    @if (isDrawerOpen()) {
      <div class="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-500">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="isDrawerOpen.set(false)"></div>
        
        <div class="relative w-full max-w-md bg-zinc-950 border-l border-white/10 shadow-[-50px_0_100px_rgba(0,0,0,1)] flex flex-col animate-in slide-in-from-right duration-700">
          <div class="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/20">
            <div>
              <h2 class="text-2xl font-black text-white tracking-tighter uppercase leading-none">File <span class="text-amber-500">d'Approbation</span></h2>
              <p class="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-2">Demandes d'adhésion en attente</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="approval-drawer-count">
                <strong>{{ pendingUsers().length }}</strong>
                <span>requests</span>
              </div>
              <button (click)="isDrawerOpen.set(false)" class="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 transition-colors">
                <lucide-icon name="x" class="w-6 h-6"></lucide-icon>
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            @for (pending of pendingUsers(); track pending.id) {
              <div class="approval-request-card">
                <div class="approval-request-line"></div>
                <div class="flex items-start gap-4 mb-5">
                  <div class="approval-request-avatar">
                    {{ getInitials(pending.nom) }}
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-base font-black text-white uppercase tracking-tight">{{ pending.nom }}</h4>
                    <p class="text-[10px] font-bold text-zinc-500 truncate">{{ pending.email }}</p>
                    <div class="approval-locked-state">
                      <lucide-icon name="lock-keyhole" class="w-3.5 h-3.5"></lucide-icon>
                      <span>Connexion bloquée jusqu'à validation admin</span>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <button (click)="rejectUser(pending.id)" class="h-10 rounded-xl border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all">
                    Rejeter
                  </button>
                  <button (click)="approveUser(pending.id)" class="h-10 rounded-xl bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg">
                    Approuver
                  </button>
                </div>
              </div>
            } @empty {
              <div class="h-full flex flex-col items-center justify-center opacity-30">
                <lucide-icon name="check-circle" class="w-16 h-16 mb-4"></lucide-icon>
                <p class="text-[10px] font-black uppercase tracking-[0.3em]">Tout est à jour</p>
              </div>
            }
          </div>

          <div class="p-8 bg-zinc-900/40 border-t border-white/5">
            <p class="text-[9px] font-bold text-zinc-500 leading-relaxed italic text-center">
              Les utilisateurs approuvés recevront immédiatement leurs privilèges d'accès au catalogue.
            </p>
          </div>
        </div>
      </div>
    }

  `,
  styles: [`
    .active-role { @apply border-amber-500/40 bg-amber-500/10 shadow-[inset_0_0_40px_rgba(245,158,11,0.05)]; }
    .approval-icon-trigger {
      position: relative;
      width: 86px;
      min-height: 100%;
      border-radius: 1rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #f59e0b;
      background: radial-gradient(circle at 30% 20%, rgba(245,158,11,0.2), rgba(24,24,27,0.46));
      border: 1px solid rgba(245,158,11,0.28);
      box-shadow: 0 20px 50px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.1);
      transition: 0.22s ease;
    }
    .approval-icon-trigger:hover {
      transform: translateY(-2px);
      border-color: rgba(245,158,11,0.58);
      box-shadow: 0 24px 58px rgba(245,158,11,0.14), inset 0 1px 0 rgba(255,255,255,0.12);
    }
    .approval-icon-trigger span,
    .approval-toolbar-icon span {
      position: absolute;
      right: -8px;
      top: -8px;
      min-width: 25px;
      height: 25px;
      padding: 0 7px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #f59e0b;
      color: #050506;
      border: 2px solid #09090b;
      font-size: 0.66rem;
      font-weight: 950;
      font-family: monospace;
      box-shadow: 0 0 22px rgba(245,158,11,0.28);
    }
    .approval-toolbar-icon {
      position: relative;
      width: 56px;
      height: 56px;
      border-radius: 1rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #f59e0b;
      background: rgba(245,158,11,0.1);
      border: 1px solid rgba(245,158,11,0.24);
      transition: 0.2s ease;
    }
    .approval-toolbar-icon:hover {
      background: #f59e0b;
      color: #050506;
    }
    .vendor-request-badge {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      z-index: 2;
      min-width: 46px;
      height: 25px;
      padding: 0 0.45rem;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      color: #050506;
      background: #f59e0b;
      border: 2px solid #09090b;
      box-shadow: 0 0 22px rgba(245,158,11,0.28);
      transition: 0.2s ease;
    }
    .vendor-request-badge:hover {
      transform: translateY(-1px);
      background: #fbbf24;
    }
    .vendor-request-badge span {
      font-family: monospace;
      font-size: 0.66rem;
      font-weight: 950;
      line-height: 1;
    }
    .approval-drawer-count {
      min-width: 70px;
      height: 42px;
      padding: 0 0.75rem;
      border-radius: 0.9rem;
      display: grid;
      place-items: center;
      background: rgba(245,158,11,0.1);
      border: 1px solid rgba(245,158,11,0.22);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
    }
    .approval-drawer-count strong {
      color: #fbbf24;
      font-family: monospace;
      font-size: 1rem;
      font-weight: 950;
      line-height: 1;
    }
    .approval-drawer-count span {
      color: #71717a;
      font-size: 0.46rem;
      font-weight: 950;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      line-height: 1;
    }
    .approval-request-card {
      position: relative;
      padding: 1.25rem;
      border-radius: 1.25rem;
      border: 1px solid rgba(245,158,11,0.18);
      background: linear-gradient(145deg, rgba(245,158,11,0.075), rgba(24,24,27,0.48));
      transition: 0.24s ease;
      overflow: hidden;
    }
    .approval-request-card:hover {
      border-color: rgba(245,158,11,0.42);
      transform: translateY(-2px);
    }
    .approval-request-line {
      position: absolute;
      left: 18px;
      right: 18px;
      top: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #f59e0b, rgba(255,255,255,0.6), transparent);
    }
    .approval-request-avatar {
      width: 48px;
      height: 48px;
      border-radius: 0.95rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #050506;
      background: linear-gradient(135deg, #f59e0b, #fff7ed);
      font-size: 0.78rem;
      font-weight: 950;
      box-shadow: 0 16px 34px rgba(245,158,11,0.16);
      flex-shrink: 0;
    }
    .approval-locked-state {
      margin-top: 0.6rem;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.35rem 0.55rem;
      border-radius: 999px;
      color: #fbbf24;
      background: rgba(245,158,11,0.08);
      border: 1px solid rgba(245,158,11,0.14);
    }
    .approval-locked-state span {
      color: #d4d4d8;
      font-size: 0.56rem;
      font-weight: 900;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
    .pending-request-strip {
      margin-bottom: 1.5rem;
      padding: 1rem;
      border-radius: 1.35rem;
      background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(24,24,27,0.55));
      border: 1px solid rgba(245,158,11,0.22);
      box-shadow: 0 26px 70px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08);
      display: grid;
      grid-template-columns: minmax(260px, 0.85fr) minmax(0, 1.5fr);
      gap: 1rem;
      align-items: center;
      overflow: hidden;
      position: relative;
    }
    .pending-request-strip::before {
      content: '';
      position: absolute;
      left: 18px;
      right: 18px;
      top: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(245,158,11,0.95), rgba(255,255,255,0.45), transparent);
    }
    .pending-strip-head { display: flex; align-items: center; gap: 1rem; min-width: 0; }
    .pending-strip-icon {
      position: relative;
      width: 58px;
      height: 58px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #050506;
      background: linear-gradient(135deg, #f59e0b, #fff7ed);
      box-shadow: 0 16px 34px rgba(245,158,11,0.18);
      flex-shrink: 0;
    }
    .pending-strip-icon span {
      position: absolute;
      right: -7px;
      top: -7px;
      min-width: 24px;
      height: 24px;
      padding: 0 7px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #050506;
      color: #fbbf24;
      border: 1px solid rgba(245,158,11,0.5);
      font-size: 0.65rem;
      font-weight: 950;
      font-family: monospace;
    }
    .pending-strip-head h3 { color: white; font-size: 1.05rem; font-weight: 950; letter-spacing: 0; text-transform: uppercase; }
    .pending-strip-head p { color: #a1a1aa; font-size: 0.72rem; font-weight: 800; margin-top: 0.28rem; line-height: 1.35; }
    .pending-strip-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.75rem; }
    .pending-mini-ticket {
      min-width: 0;
      min-height: 76px;
      padding: 0.75rem;
      border-radius: 1rem;
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr) auto;
      gap: 0.75rem;
      align-items: center;
      background: rgba(0,0,0,0.32);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .pending-mini-avatar {
      width: 42px;
      height: 42px;
      border-radius: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #050506;
      background: #f59e0b;
      font-size: 0.75rem;
      font-weight: 950;
    }
    .pending-mini-ticket strong { display: block; color: white; font-size: 0.8rem; font-weight: 950; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pending-mini-ticket span { display: block; color: #71717a; font-size: 0.66rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 0.2rem; }
    .pending-mini-actions { display: flex; gap: 0.4rem; }
    .pending-mini-actions button {
      width: 38px;
      height: 38px;
      border-radius: 0.8rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: 0.2s ease;
    }
    .pending-mini-actions .reject { color: #f87171; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); }
    .pending-mini-actions .approve { color: #050506; background: #f59e0b; border: 1px solid rgba(245,158,11,0.72); }
    .pending-mini-actions button:hover { transform: translateY(-2px); filter: brightness(1.08); }
    @media (max-width: 980px) {
      .pending-request-strip { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminVendeursComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);

  users = signal<any[]>([]);
  pendingUsers = signal<any[]>([]);
  searchQuery = signal('');
  isEditModalOpen = signal(false);
  isDrawerOpen = signal(false);
  selectedUser = signal<any | null>(null);
  tempRole = signal<string>('');

  // Flagship Feedback System
  pendingDeleteAction = signal<{ id: number, name: string } | null>(null);
  pendingRoleAction = signal<{ id: number, name: string } | null>(null);
  activeDeleteElement: HTMLElement | null = null;
  activeRoleElement: HTMLElement | null = null;
  deleteBtnPos = signal({ x: 0, y: 0 });
  windowWidth = signal(window.innerWidth);
  windowHeight = signal(window.innerHeight);
  activeToast = signal<{ message: string, type: 'success' | 'error' } | null>(null);

  @HostListener('window:scroll')
  onScroll() {
    const activeElement = this.pendingDeleteAction()
      ? this.activeDeleteElement
      : this.pendingRoleAction()
        ? this.activeRoleElement
        : null;

    if (activeElement) {
      const rect = activeElement.getBoundingClientRect();
      this.deleteBtnPos.set({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
  }

  availableRoles = ['CLIENT', 'VENDEUR', 'ADMIN'];

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
    const panelWidth = this.pendingRoleAction() ? 300 : 260;
    const preferred = this.deleteBtnPos().x - (panelWidth + 26);
    return Math.min(Math.max(preferred, 16), this.windowWidth() - (panelWidth + 16));
  });

  alertTop = computed(() => {
    const preferred = this.deleteBtnPos().y - 74;
    return Math.min(Math.max(preferred, 86), this.windowHeight() - 176);
  });

  alertAnchorX = computed(() => this.alertLeft() + (this.pendingRoleAction() ? 292 : 252));
  alertAnchorY = computed(() => this.alertTop() + 36);


  vendorCount = computed(() => this.users().filter(u => u.roles?.some((r: any) => r.name === 'ROLE_VENDEUR')).length);
  adminCount = computed(() => this.users().filter(u => u.roles?.some((r: any) => r.name === 'ROLE_ADMIN')).length);
  clientCount = computed(() => this.users().filter(u => u.roles?.some((r: any) => r.name === 'ROLE_CLIENT')).length);

  centerAdvice = computed(() => {
    const total = this.users().length;
    const pending = this.pendingUsers().length;

    if (pending > 0) return `Action requise: ${pending} demande(s) en attente d'approbation système.`;
    if (!total) return 'Registre vide: en attente des premières inscriptions partenaires.';
    return 'Gouvernance stable: tous les profils actifs sont conformes aux politiques.';
  });

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const allUsers = this.users();
    if (!Array.isArray(allUsers)) return [];

    return allUsers.filter(u => {
      const nom = (u.nom || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return nom.includes(q) || email.includes(q);
    });
  });

  ngOnInit() {
    this.loadUsers();
    this.loadPendingUsers();
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        const activeUsers = data.filter((u: any) => u.enabled);
        this.users.set(activeUsers);
      },
      error: (err) => console.error('API Error:', err)
    });
  }

  loadPendingUsers() {
    this.adminService.getPendingUsers().subscribe({
      next: (data) => this.pendingUsers.set(data),
      error: (err) => console.error('Error loading pending:', err)
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
    this.pendingRoleAction.set(null);
    this.pendingDeleteAction.set({ id, name });
  }

  triggerRoleConfirm(user: any, event: MouseEvent) {
    this.activeRoleElement = event.currentTarget as HTMLElement;
    const rect = this.activeRoleElement.getBoundingClientRect();
    this.deleteBtnPos.set({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    this.pendingDeleteAction.set(null);
    this.selectedUser.set(user);
    this.tempRole.set(user.roles[0]?.name?.replace('ROLE_', '') || 'CLIENT');
    this.pendingRoleAction.set({ id: user.id, name: user.nom });
  }

  executeDelete(id: number) {
    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.loadUsers();
        this.loadPendingUsers();
        this.pendingDeleteAction.set(null);
        this.showToast('Profil révoqué et supprimé', 'success');
      },
      error: () => this.showToast('Erreur de suppression', 'error')
    });
  }

  // --- Toast Notification System ---
  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.activeToast.set({ message, type });
    setTimeout(() => {
      this.activeToast.set(null);
    }, 3000);
  }

  approveUser(userId: number) {
    this.adminService.approveUser(userId).subscribe({
      next: () => {
        this.loadUsers();
        this.loadPendingUsers();
        this.showToast('Accès approuvé avec succès', 'success');
      },
      error: (err) => this.showToast('Erreur d\'approbation', 'error')
    });
  }

  rejectUser(userId: number) {
    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        this.loadUsers();
        this.loadPendingUsers();
        this.showToast('Demande vendeur rejetée', 'success');
      },
      error: () => this.showToast('Erreur lors du rejet', 'error')
    });
  }

  getRoleBadgeClass(roleName: string) {
    switch (roleName) {
      case 'ROLE_ADMIN': return 'border-purple-500/40 text-purple-400 bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.1)]';
      case 'ROLE_VENDEUR': return 'border-amber-500/40 text-amber-400 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.1)]';
      default: return 'border-blue-500/40 text-blue-400 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.1)]';
    }
  }

  getRoleIcon(roleName: string): string {
    switch (roleName) {
      case 'ROLE_ADMIN': return 'shield-check';
      case 'ROLE_VENDEUR': return 'crown';
      default: return 'user';
    }
  }

  getRoleDotClass(role: string) {
    switch (role) {
      case 'ADMIN': return 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]';
      case 'VENDEUR': return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]';
      default: return 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]';
    }
  }

  getInitials(name: string | null | undefined): string {
    const parts = (name || 'Vendeur')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    return parts.map(part => part[0]?.toUpperCase() || '').join('') || 'V';
  }

  getRoleDescription(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Accès global et configuration système';
      case 'VENDEUR': return 'Gestion catalogue et inventaire';
      default: return 'Accès client standard';
    }
  }

  openEditModal(user: any) {
    this.selectedUser.set(user);
    this.tempRole.set(user.roles[0]?.name?.replace('ROLE_', '') || 'CLIENT');
    this.pendingRoleAction.set({ id: user.id, name: user.nom });
  }

  deleteUser(userId: number) {
    // Handled by executeDelete
  }

  saveRole() {
    const user = this.selectedUser();
    if (user && this.tempRole()) {
      this.adminService.updateUserRole(user.id, this.tempRole()).subscribe({
        next: () => {
          this.loadUsers();
          this.isEditModalOpen.set(false);
          this.pendingRoleAction.set(null);
          this.showToast('Privilèges mis à jour', 'success');
        },
        error: (err) => this.showToast('Erreur de configuration', 'error')
      });
    }
  }
}
