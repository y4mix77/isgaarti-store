import { Component, OnInit, signal, computed, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { VendeurService, Fournisseur } from '../../../core/services/vendeur.service';
import { Produit } from '../../../core/services/product.service';
import { VendeurBackgroundComponent } from '../../../shared/components/vendeur-background/vendeur-background.component';
import { NexusNotificationService } from '../../../core/services/nexus-notification.service';

@Component({
  selector: 'app-vendeur-fournisseurs',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, VendeurBackgroundComponent],
  template: `
    <div class="bg-glow"></div>
    <div class="bg-grid"></div>
    <app-vendeur-background></app-vendeur-background>

    <div class="relative z-10 max-w-[1700px] mx-auto px-[4%] pt-20 pb-32">
      
      <!-- Flagship Hero Section -->
      <div class="relative mb-24">
        <h1 class="text-[10rem] md:text-[14rem] font-black tracking-tighter text-white/[0.02] absolute -top-32 -left-12 select-none pointer-events-none uppercase">
          Nexus
        </h1>
        
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-10 relative z-10">
          <div>
            <div class="flex items-center gap-4 mb-4">
               <span class="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] rounded">Logistics_Nexus</span>
               <div class="h-[1px] w-12 bg-zinc-800"></div>
            </div>
            <h2 class="text-7xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
              Maillage des <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-200">Fournisseurs</span>
            </h2>
            <p class="text-zinc-500 font-bold tracking-[0.2em] text-[10px] uppercase flex items-center gap-3">
              <lucide-icon name="network" class="w-4 h-4 text-amber-500"></lucide-icon>
              Architecture de Flux et Intégrité Logistique
            </p>
          </div>
        </div>
      </div>

      <!-- Flagship Strategy Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div class="flagship-card overflow-hidden">
           <lucide-icon name="share-2" class="absolute -right-3 -bottom-3 w-20 h-20 text-white/[0.015] -rotate-12 pointer-events-none"></lucide-icon>
           <div class="relative z-10">
              <div class="flex justify-between items-start mb-5">
                 <div class="w-9 h-9 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center shadow-xl">
                    <lucide-icon name="share-2" class="w-4.5 h-4.5 text-amber-500"></lucide-icon>
                 </div>
              </div>
              <p class="text-[7px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-0.5">Nodes Certifiés</p>
              <h3 class="text-xl font-black text-white font-mono tracking-tighter">{{ fournisseurs().length }}</h3>
           </div>
        </div>
        <div class="flagship-card overflow-hidden">
           <lucide-icon name="activity" class="absolute -right-3 -bottom-3 w-20 h-20 text-white/[0.015] -rotate-12 pointer-events-none"></lucide-icon>
           <div class="relative z-10">
              <div class="flex justify-between items-start mb-5">
                 <div class="w-9 h-9 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center shadow-xl">
                    <lucide-icon name="activity" class="w-4.5 h-4.5 text-amber-500"></lucide-icon>
                 </div>
              </div>
              <p class="text-[7px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-0.5">Network Integrity</p>
              <h3 class="text-xl font-black text-white font-mono tracking-tighter">{{ contactCoverage() }}%</h3>
           </div>
        </div>
        <div class="flagship-card overflow-hidden border-amber-500/10">
           <lucide-icon name="link-2" class="absolute -right-3 -bottom-3 w-20 h-20 text-amber-500/[0.02] -rotate-12 pointer-events-none"></lucide-icon>
           <div class="relative z-10">
              <div class="flex justify-between items-start mb-5">
                 <div class="w-9 h-9 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center shadow-xl">
                    <lucide-icon name="link-2" class="w-4.5 h-4.5 text-amber-500"></lucide-icon>
                 </div>
                 <div class="px-2 py-0.5 bg-amber-500/10 rounded text-[6px] font-black text-amber-500 uppercase tracking-widest italic">Optimized</div>
              </div>
              <p class="text-[7px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-0.5">Matrix Linking</p>
              <h3 class="text-xl font-black text-white font-mono tracking-tighter">{{ myProducts().length }}</h3>
           </div>
        </div>
      </div>

      <!-- Main Nexus Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- SIDEBAR: PARTNER INTAKE -->
        <aside class="lg:col-span-4 space-y-6 sticky top-24">
           <div class="flagship-panel p-8 relative group overflow-hidden border-amber-500/10">
              <div class="absolute inset-0 bg-gradient-to-b from-amber-500/[0.04] to-transparent pointer-events-none"></div>
              <div class="absolute top-0 left-0 w-full h-[1px] bg-amber-500/20 scan-line"></div>
              
              <div class="flex justify-between items-start mb-10 relative z-10">
                 <div>
                    <h3 class="text-2xl font-black text-white uppercase tracking-tighter leading-none">Partner Forge</h3>
                    <p class="text-[7px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                       <span class="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>
                       Node_Authorization_Protocol
                    </p>
                 </div>
                 <div class="w-12 h-12 rounded-xl bg-zinc-950 border border-amber-500/20 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                    <div class="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <lucide-icon name="user-plus" class="w-6 h-6 text-amber-500"></lucide-icon>
                 </div>
              </div>

              <div class="space-y-6 relative z-10">
                 <!-- Intake Integrity HUD -->
                 <div class="p-5 rounded-2xl bg-zinc-950/50 border border-white/5 backdrop-blur-xl relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent"></div>
                    <div class="flex justify-between items-center mb-4">
                       <span class="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Intégrité Preview</span>
                       <span class="text-[10px] font-mono text-amber-500 font-black">{{ intakeReadiness() }}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                       <div class="h-full bg-amber-500 shadow-[0_0_10px_#fbbf24] transition-all duration-700" [style.width.%]="intakeReadiness()"></div>
                    </div>
                 </div>

                 <div class="space-y-5">
                    <!-- Terminal Style Input Shells -->
                    <div class="terminal-shell group/shell">
                       <div class="terminal-header-v2">
                          <span class="dot"></span>
                          <span class="label">NODE_DESIGNATION</span>
                       </div>
                       <div class="relative flex items-center px-4">
                          <lucide-icon name="building" class="w-4 h-4 text-zinc-700 group-focus-within/shell:text-amber-500 transition-colors mr-4"></lucide-icon>
                          <input type="text" [ngModel]="fNom()" (ngModelChange)="fNom.set($event)" placeholder="Entité Nom..." class="terminal-input !pl-0">
                       </div>
                    </div>

                    <div class="terminal-shell group/shell">
                       <div class="terminal-header-v2">
                          <span class="dot"></span>
                          <span class="label">COMM_LINK</span>
                       </div>
                       <div class="relative flex items-center px-4">
                          <lucide-icon name="mail" class="w-4 h-4 text-zinc-700 group-focus-within/shell:text-amber-500 transition-colors mr-4"></lucide-icon>
                          <input type="email" [ngModel]="fEmail()" (ngModelChange)="fEmail.set($event)" placeholder="contact@nexus.sys" class="terminal-input !pl-0">
                       </div>
                    </div>

                    <div class="terminal-shell group/shell">
                       <div class="terminal-header-v2">
                          <span class="dot"></span>
                          <span class="label">DIGITAL_ID</span>
                       </div>
                       <div class="relative flex items-center px-4">
                          <lucide-icon name="phone" class="w-4 h-4 text-zinc-700 group-focus-within/shell:text-amber-500 transition-colors mr-4"></lucide-icon>
                          <input type="text" [ngModel]="fPhone()" (ngModelChange)="fPhone.set($event)" placeholder="+XX XXX XXX" class="terminal-input !pl-0">
                       </div>
                    </div>

                    <button (click)="createFournisseur()" class="tactical-launch-btn w-full mt-4 group">
                       <div class="btn-layout flex items-center justify-between px-6 py-5">
                          <div class="flex items-center gap-4">
                             <div class="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-black group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/20">
                                <lucide-icon name="shield-check" class="w-5 h-5"></lucide-icon>
                             </div>
                             <div class="text-left">
                                <span class="block text-[10px] font-black text-white uppercase tracking-widest">Execute Protocol</span>
                                <small class="text-[7px] font-bold text-zinc-500 uppercase tracking-widest">Certifier le Node</small>
                             </div>
                          </div>
                          <lucide-icon name="arrow-right" class="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform"></lucide-icon>
                       </div>
                       <div class="btn-progress h-0.5 w-full bg-zinc-800">
                          <div class="h-full bg-amber-500 transition-all duration-500" [style.width.%]="intakeReadiness()"></div>
                       </div>
                    </button>
                 </div>
              </div>
           </div>

           <!-- COMPACT DIRECTORY -->
           <div class="space-y-4">
              <h4 class="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] px-3 flex justify-between items-center">
                 Annuaire Certifié
                 <span class="text-amber-500/30">{{ fournisseurs().length }} SECURED</span>
              </h4>
              <div class="custom-scrollbar max-h-[350px] overflow-y-auto space-y-2 pr-2">
                 @for (f of fournisseurs(); track f.id) {
                    <div class="flagship-list-card p-4 group">
                       <div class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center group-hover:border-amber-500/30 transition-all relative">
                             <lucide-icon name="shield-check" class="w-5 h-5 text-zinc-800 group-hover:text-amber-500"></lucide-icon>
                             <div class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                          </div>
                          <div class="flex-1 min-w-0">
                             <h5 class="text-sm font-black text-white group-hover:text-amber-500 transition-colors truncate">{{ f.nom }}</h5>
                             <p class="text-[8px] font-bold text-zinc-600 uppercase tracking-widest truncate">{{ f.email }}</p>
                          </div>
                       </div>
                    </div>
                 }
              </div>
           </div>
        </aside>

        <!-- MAIN PANEL: DEPENDENCY MATRIX -->
        <main class="lg:col-span-8">
           <div class="flagship-panel overflow-hidden">
              <div class="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                 <div>
                    <h3 class="text-2xl font-black text-white tracking-tighter uppercase mb-1">Matrice de Dépendance</h3>
                    <p class="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Infrastructure Logistique v4.2</p>
                 </div>
                 <div class="w-12 h-12 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center">
                    <lucide-icon name="network" class="w-6 h-6 text-zinc-700"></lucide-icon>
                 </div>
              </div>

              <div class="p-6 md:p-10">
                 <div class="grid grid-cols-1 gap-3">
                    @for (p of myProducts(); track p.id) {
                       <div class="flagship-row p-6 group overflow-hidden relative">
                          <div class="absolute inset-0 bg-gradient-to-r from-amber-500/[0.01] to-transparent pointer-events-none"></div>
                          
                          <div class="flex items-center gap-8 flex-1 relative z-10">
                             <div class="w-20 h-20 rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden flex items-center justify-center group-hover:border-amber-500/40 transition-all duration-700 shadow-3xl relative">
                                <img *ngIf="p.image" [src]="p.image" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                                <lucide-icon *ngIf="!p.image" name="package" class="w-10 h-10 text-zinc-900"></lucide-icon>
                                <div class="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                                <div class="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[6px] font-black text-amber-500 uppercase tracking-widest">
                                   NODE_{{ p.id }}
                                </div>
                             </div>
                             
                             <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-3 mb-3">
                                   <span class="w-1.5 h-1.5 rounded-full bg-amber-500/30 group-hover:bg-amber-500 transition-colors animate-pulse"></span>
                                   <h5 class="text-xl font-black text-white truncate group-hover:text-amber-500 transition-colors tracking-tight">{{ p.nom }}</h5>
                                </div>
                                <div class="flex items-center gap-6">
                                   <div class="flex items-center gap-2">
                                      <div class="w-8 h-8 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center">
                                         <lucide-icon name="box" class="w-4 h-4 text-zinc-700 group-hover:text-amber-500/40"></lucide-icon>
                                      </div>
                                      <div class="flex flex-col">
                                         <span class="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Reserve</span>
                                         <span class="text-xs font-mono text-zinc-400 tracking-tighter">{{ p.stock }} units</span>
                                      </div>
                                   </div>
                                   <div class="flex items-center gap-2">
                                      <div class="w-8 h-8 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center">
                                         <lucide-icon name="factory" class="w-4 h-4 text-zinc-700 group-hover:text-amber-500/40"></lucide-icon>
                                      </div>
                                      <div class="flex flex-col">
                                         <span class="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Origin</span>
                                         <span class="text-[9px] font-black text-zinc-500 uppercase tracking-tighter italic">Verified_Link</span>
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <!-- Unique Idea: Live Topology HUD -->
                             <div class="hidden 2xl:flex items-center gap-6 px-10 border-l border-white/5">
                                <div class="relative w-28 h-14 bg-zinc-950/80 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden group/hud">
                                   <div class="absolute inset-0 opacity-[0.03] pointer-events-none">
                                      <div class="data-stream-v"></div>
                                   </div>
                                   <div class="flex items-end gap-1 relative z-10 px-4">
                                      <div *ngFor="let i of [1,2,3,4,5,6,7,8]" class="w-1.5 bg-amber-500/10 rounded-full group-hover:bg-amber-500/40 transition-all duration-700" 
                                           [style.height.px]="(p.id * (i+1) % 24) + 8"></div>
                                   </div>
                                   <span class="absolute top-1 right-2 text-[6px] font-black text-zinc-700 tracking-widest uppercase">Signal_Strength</span>
                                   <div class="absolute bottom-1 left-2 text-[5px] font-mono text-zinc-800">0x{{ p.id }}A7...</div>
                                </div>
                             </div>

                             <div class="hidden xl:flex items-center gap-10 px-8 border-l border-white/5">
                                <div class="text-right">
                                   <p class="text-[7px] font-black text-zinc-600 uppercase tracking-widest mb-2.5">Stability_Mesh</p>
                                   <div class="flex items-center gap-1.5">
                                      <div *ngFor="let i of [1,2,3,4,5]" class="w-4 h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                                         <div class="h-full bg-gradient-to-r from-amber-500/40 to-amber-200/40" [style.width.%]="p.id % (i+1) === 0 ? 100 : 20"></div>
                                      </div>
                                   </div>
                                </div>
                                <div class="text-right">
                                   <p class="text-[7px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Status</p>
                                   <div class="flex items-center gap-2">
                                      <div class="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                      <span class="text-xs font-black text-zinc-400 font-mono uppercase tracking-tighter">SECURED</span>
                                   </div>
                                </div>
                             </div>
                          </div>

                          <button (click)="openAssignModal(p)" class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all relative z-10 group/btn" title="Configure Link">
                             <lucide-icon name="link" class="w-6 h-6 group-hover/btn:rotate-12 transition-transform"></lucide-icon>
                          </button>
                       </div>
                    }
                 </div>
              </div>
           </div>
        </main>
      </div>
    </div>

    <!-- FLAGSHIP SLIDE PANEL -->
    <div class="flagship-drawer-backdrop" [class.active]="isModalOpen()" (click)="closeModal()"></div>
    <div class="flagship-drawer" [class.active]="isModalOpen()">
       <div class="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <div class="flex items-center gap-4">
             <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <lucide-icon name="workflow" class="w-6 h-6 text-amber-500"></lucide-icon>
             </div>
             <div>
                <p class="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-1">Architecture_Link</p>
                <h3 class="text-2xl font-black text-white uppercase tracking-tighter">Linking Protocol</h3>
             </div>
          </div>
          <button (click)="closeModal()" class="w-10 h-10 rounded-xl bg-white/5 text-zinc-500 hover:text-white transition-all">
             <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
          </button>
       </div>

       <div class="flex-1 overflow-y-auto custom-scrollbar p-10 pt-8">
          <div *ngIf="selectedProduct()" class="mb-10 p-6 rounded-3xl bg-zinc-900/50 border border-white/5 flex items-center gap-6">
             <div class="w-16 h-16 rounded-2xl bg-zinc-800 overflow-hidden border border-white/5 shadow-2xl">
                <img *ngIf="selectedProduct()?.image" [src]="selectedProduct()?.image" class="w-full h-full object-cover">
                <lucide-icon *ngIf="!selectedProduct()?.image" name="package" class="w-10 h-10 text-zinc-700"></lucide-icon>
             </div>
             <div>
                <h4 class="text-xl font-black text-white tracking-tighter">{{ selectedProduct()?.nom }}</h4>
                <p class="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">ID: #{{ selectedProduct()?.id }}</p>
             </div>
          </div>

          <div class="space-y-8">
             <label class="text-[9px] font-black text-zinc-500 uppercase tracking-[0.5em] px-2 block">Nodes Disponibles</label>
             <div class="grid grid-cols-1 gap-3">
                @for (f of fournisseurs(); track f.id) {
                   <button (click)="toggleFournisseur(f.id)"
                           [class.active]="selectedFournisseurIds().includes(f.id)"
                           class="flagship-select-card">
                      <div class="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center transition-colors duration-500"
                           [class.border-amber-500/40]="selectedFournisseurIds().includes(f.id)">
                         <lucide-icon name="database" class="w-5 h-5" 
                                     [class.text-amber-500]="selectedFournisseurIds().includes(f.id)" 
                                     [class.text-zinc-800]="!selectedFournisseurIds().includes(f.id)"></lucide-icon>
                      </div>
                      <div class="flex-1 text-left">
                         <h6 class="text-sm font-black text-white mb-0.5" [class.text-amber-500]="selectedFournisseurIds().includes(f.id)">{{ f.nom }}</h6>
                         <p class="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{{ f.email }}</p>
                      </div>
                      <div class="w-6 h-6 rounded-lg border-2 border-white/10 flex items-center justify-center transition-all" [class.bg-amber-500]="selectedFournisseurIds().includes(f.id)">
                         <lucide-icon name="check" class="w-3 h-3 text-black opacity-0" [class.opacity-100]="selectedFournisseurIds().includes(f.id)"></lucide-icon>
                      </div>
                   </button>
                }
             </div>
          </div>
       </div>

       <div class="p-10 border-t border-white/5 bg-white/[0.01] flex gap-4">
          <button (click)="closeModal()" class="flex-1 py-4 rounded-2xl border border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Abandonner</button>
          <button (click)="saveAssociation()" class="flex-[1.5] py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-amber-500 transition-all flex items-center justify-center gap-3">
             <lucide-icon name="zap" class="w-4 h-4"></lucide-icon>
             Activer Link
          </button>
       </div>
    </div>

    <style>
      .flagship-card { background: linear-gradient(135deg, rgba(15, 15, 18, 0.8), rgba(5, 5, 7, 0.95)); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.04); border-radius: 16px; transition: 0.4s; padding: 18px 22px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
      .flagship-card:hover { border-color: rgba(251, 191, 36, 0.25); transform: translateY(-3px); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
      .flagship-card::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top right, rgba(251, 191, 36, 0.05), transparent 70%); pointer-events: none; }

      .flagship-panel { background: rgba(12, 12, 14, 0.9); backdrop-filter: blur(60px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 24px; box-shadow: 0 40px 100px rgba(0,0,0,0.6); position: relative; }
      
      .scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 1px; background: #fbbf24; box-shadow: 0 0 15px #fbbf24; opacity: 0; animation: scan-v 3s linear infinite; pointer-events: none; }
      @keyframes scan-v { 0% { top: 0; opacity: 0; } 10% { opacity: 0.5; } 90% { opacity: 0.5; } 100% { top: 100%; opacity: 0; } }

      .data-stream-v { position: absolute; inset: 0; background: linear-gradient(0deg, transparent, #fbbf24 50%, transparent); height: 100%; width: 100%; animation: stream-v 2s linear infinite; }
      @keyframes stream-v { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }

      .terminal-shell { position: relative; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; transition: 0.3s; overflow: hidden; }
      .terminal-shell:focus-within { border-color: #fbbf24; background: rgba(251,191,36,0.03); box-shadow: 0 0 30px rgba(251, 191, 36, 0.05); }
      .terminal-header-v2 { padding: 8px 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.03); background: rgba(255,255,255,0.01); }
      .terminal-header-v2 .dot { width: 4px; height: 4px; background: #fbbf24; border-radius: 999px; }
      .terminal-header-v2 .label { font-size: 6px; font-weight: 900; color: #52525b; text-transform: uppercase; letter-spacing: 0.2em; }
      .terminal-input { width: 100%; background: transparent; border: none; padding: 16px 16px 16px 48px; color: #fff; font-size: 13px; font-weight: 900; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; outline: none; }
      .terminal-input::placeholder { color: #27272a; }

      .tactical-launch-btn { background: #121214; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; transition: 0.3s; cursor: pointer; padding: 0; }
      .tactical-launch-btn:hover { border-color: rgba(251, 191, 36, 0.4); background: #18181b; transform: translateY(-2px); }

      .flagship-input { width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 16px; color: #fff; font-size: 14px; font-weight: 600; outline: none; transition: 0.3s; }
      .flagship-input:focus { border-color: #fbbf24; background: rgba(0,0,0,0.6); box-shadow: 0 0 40px rgba(251, 191, 36, 0.1); }

      .flagship-action-btn { background: #fff; color: #000; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; transition: 0.4s; border: none; cursor: pointer; border-radius: 16px; }
      .flagship-action-btn:hover { background: #fbbf24; transform: translateY(-2px); box-shadow: 0 20px 45px rgba(251, 191, 36, 0.3); }

      .flagship-list-card { background: rgba(18, 18, 22, 0.6); border: 1px solid rgba(255,255,255,0.04); border-radius: 16px; transition: 0.3s; }
      .flagship-list-card:hover { transform: translateX(5px); border-color: rgba(251,191,36,0.15); }

      .flagship-row { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.005); border: 1px solid rgba(255,255,255,0.02); border-radius: 20px; transition: 0.4s; }
      .flagship-row:hover { background: rgba(255,255,255,0.02); border-color: rgba(251,191,36,0.2); transform: scale(1.005); }

      .flagship-drawer-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(16px); z-index: 10000; opacity: 0; pointer-events: none; transition: 0.6s; }
      .flagship-drawer-backdrop.active { opacity: 1; pointer-events: auto; }
      .flagship-drawer { position: fixed; top: 0; right: 0; width: 440px; height: 100vh; background: #0c0c0e; border-left: 1px solid rgba(255,255,255,0.08); z-index: 10001; transition: 0.7s cubic-bezier(0.16, 1, 0.3, 1); transform: translateX(100%); display: flex; flex-direction: column; box-shadow: -40px 0 100px rgba(0,0,0,1); }
      .flagship-drawer.active { transform: translateX(0); }

      .flagship-select-card { width: 100%; display: flex; align-items: center; gap: 16px; padding: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 20px; transition: 0.3s; cursor: pointer; }
      .flagship-select-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(251, 191, 36, 0.2); }
      .flagship-select-card.active { background: rgba(251, 191, 36, 0.05); border-color: #fbbf24; }

      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 20px; }
    </style>
  `
})
export class VendeurFournisseursComponent implements OnInit, AfterViewInit, OnDestroy {
  private vendeurService = inject(VendeurService);
  private notify = inject(NexusNotificationService);
  
  fournisseurs = signal<Fournisseur[]>([]);
  myProducts = signal<Produit[]>([]);

  // Form Signals
  fNom = signal('');
  fEmail = signal('');
  fPhone = signal('');
  
  // Unique Idea: Intake Readiness Score
  intakeReadiness = computed(() => {
    let score = 0;
    if (this.fNom().length > 2) score += 40;
    if (this.fEmail().includes('@')) score += 30;
    if (this.fPhone().length > 5) score += 30;
    return score;
  });

  contactCoverage = computed(() => {
    const suppliers = this.fournisseurs();
    return suppliers.length ? Math.round((suppliers.filter(f => !!f.email).length / suppliers.length) * 100) : 0;
  });

  isModalOpen = signal(false);
  selectedProductId = signal<number | null>(null);
  selectedFournisseurIds = signal<number[]>([]);

  selectedProduct = computed(() => {
    const id = this.selectedProductId();
    return this.myProducts().find(p => p.id === id) || null;
  });

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {}

  ngOnDestroy() {}

  loadData() {
    this.vendeurService.getFournisseurs().subscribe(data => this.fournisseurs.set(data));
    this.vendeurService.getMesProduits().subscribe(data => {
      const uniqueProducts = Array.from(new Map(data.map(p => [p.id, p])).values());
      this.myProducts.set(uniqueProducts);
    });
  }

  createFournisseur() {
    if (!this.fNom() || !this.fEmail()) return;
    this.vendeurService.addFournisseur({
      nom: this.fNom(),
      email: this.fEmail(),
      telephone: this.fPhone()
    }).subscribe(() => {
      this.loadData();
      this.notify.success(`Node certifié: ${this.fNom()}`);
      this.fNom.set('');
      this.fEmail.set('');
      this.fPhone.set('');
    });
  }

  openAssignModal(product?: Produit) {
    if (product) this.selectedProductId.set(product.id);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedProductId.set(null);
    this.selectedFournisseurIds.set([]);
  }

  toggleFournisseur(id: number) {
    const current = this.selectedFournisseurIds();
    if (current.includes(id)) {
      this.selectedFournisseurIds.set(current.filter(fid => fid !== id));
    } else {
      this.selectedFournisseurIds.set([...current, id]);
    }
  }

  saveAssociation() {
    if (!this.selectedProductId() || this.selectedFournisseurIds().length === 0) return;
    this.vendeurService.associerFournisseurs(this.selectedProductId()!, this.selectedFournisseurIds())
      .subscribe(() => {
        this.loadData();
        this.notify.success('Maillage activé avec succès');
        this.closeModal();
      });
  }
}
