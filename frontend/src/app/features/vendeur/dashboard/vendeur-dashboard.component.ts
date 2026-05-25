import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, computed, HostListener, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { AuthService } from '../../../core/services/auth.service';
import { VendeurService, VendeurDashboardData } from '../../../core/services/vendeur.service';
import { VendeurBackgroundComponent } from '../../../shared/components/vendeur-background/vendeur-background.component';

@Component({
  selector: 'app-vendeur-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, VendeurBackgroundComponent],
  providers: [DatePipe, CurrencyPipe],
  template: `
    <app-vendeur-background [showParticles]="true" [showNebula]="true"></app-vendeur-background>

    <div class="relative z-10 max-w-[1700px] mx-auto px-[4%] pt-12 pb-32">
      
      <!-- Premium Vendor Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div class="flex items-center gap-10">
          <div class="relative group">
            <div class="w-28 h-28 rounded-2xl bg-zinc-900/80 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white shadow-[0_30px_60px_rgba(0,0,0,0.9)] overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
              <lucide-icon name="user" class="w-14 h-14 text-amber-500 transition-transform group-hover:scale-110 duration-1000"></lucide-icon>
            </div>
            <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-950 rounded-full flex items-center justify-center border-4 border-zinc-950">
               <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,1)]"></div>
            </div>
          </div>
          <div>
            <div class="flex items-center gap-4 mb-3">
               <span class="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] rounded">Espace Vendeur</span>
               <div class="h-1 w-8 bg-zinc-800 rounded-full"></div>
            </div>
            <h1 class="text-6xl md:text-9xl font-black tracking-tighter text-white mb-4 leading-[0.85]">
              {{ vendorName() }} <span class="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 via-white to-zinc-500 opacity-50">Portal</span>
            </h1>
            <div class="flex items-center gap-8">
              <p class="text-zinc-500 font-black tracking-widest text-[10px] uppercase flex items-center gap-3">
                <lucide-icon name="radio" class="w-3.5 h-3.5 text-amber-500"></lucide-icon>
                Status: <span class="text-zinc-200">En ligne</span>
              </p>
              <div class="h-1.5 w-1.5 rounded-full bg-zinc-800"></div>
              <p class="text-zinc-500 font-black tracking-widest text-[10px] uppercase flex items-center gap-3">
                <lucide-icon name="history" class="w-3.5 h-3.5 text-zinc-400"></lucide-icon>
                Performance: <span class="text-zinc-200">99.9%</span>
              </p>
            </div>
          </div>
        </div>
        
    <div class="flex gap-6 items-center">
          <!-- Notification Bell -->
          <button (click)="toggleNotifications()" class="relative p-5 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all shadow-2xl group/bell">
             <lucide-icon name="bell" class="w-6 h-6"></lucide-icon>
             <span class="absolute top-4 right-4 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-zinc-950 animate-pulse"></span>
             
             <!-- Tooltip -->
             <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-zinc-950 border border-white/10 rounded text-[8px] font-black uppercase tracking-widest opacity-0 group-hover/bell:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Centre d'Alertes
             </div>
          </button>

          <div class="flex flex-col items-end mr-4">
             <span class="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Réseau Actif</span>
             <div class="flex gap-1.5">
                @for (i of [1,2,3,4,5]; track i) {
                  <div [class]="i < 5 ? 'bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-zinc-800'" class="w-4 h-1 rounded-full"></div>
                }
             </div>
          </div>
          <button (click)="toggleSpotlight()" class="group px-8 py-5 bg-white/5 border border-white/10 rounded-xl text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-4 shadow-2xl">
             <lucide-icon name="command" class="w-5 h-5 text-amber-500"></lucide-icon> Gérer
          </button>
        </div>
      </div>



      <!-- Industrial KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        @for (kpi of kpis; track kpi.title) {
          <div class="group relative p-8 rounded-2xl bg-zinc-900/80 backdrop-blur-3xl border border-white/5 hover:border-amber-500/40 transition-all duration-500 shadow-2xl overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/[0.03] to-transparent pointer-events-none"></div>
            <div class="absolute top-0 right-0 w-1 h-12 bg-amber-500/20 group-hover:bg-amber-500 transition-colors duration-700"></div>
            <div class="absolute top-0 right-0 w-12 h-1 bg-amber-500/20 group-hover:bg-amber-500 transition-colors duration-700"></div>
            
            <div class="relative z-10">
               <div class="flex justify-between items-start mb-10">
                  <div class="w-12 h-12 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center group-hover:border-amber-500/30 transition-all">
                     <lucide-icon [name]="kpi.icon" class="w-6 h-6 text-zinc-500 group-hover:text-amber-500 transition-colors"></lucide-icon>
                  </div>
                  <div class="text-right">
                    <span [class]="kpi.trend >= 0 ? 'text-green-500' : 'text-red-500'" class="text-[10px] font-black flex items-center justify-end gap-1 mb-1">
                      {{ kpi.trend >= 0 ? '+' : '' }}{{ kpi.trend }}%
                      <lucide-icon [name]="kpi.trend >= 0 ? 'arrow-up-right' : 'arrow-down-right'" class="w-3 h-3"></lucide-icon>
                    </span>
                    <span class="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Temps Réel</span>
                  </div>
               </div>

               <p class="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-3">{{ kpi.title }}</p>
               <h3 class="text-4xl font-black text-white font-mono tracking-tighter mb-6">{{ kpi.prefix }}{{ kpi.value }}{{ kpi.suffix }}</h3>

               <div class="flex gap-1">
                  @for (dot of [1,2,3,4,5,6,7,8]; track dot) {
                    <div class="h-1 flex-1 bg-white/[0.03] rounded-full overflow-hidden">
                       <div class="h-full bg-amber-500/40 w-[40%] group-hover:w-full transition-all duration-1000 delay-{{dot*100}}"></div>
                    </div>
                  }
               </div>
            </div>
          </div>
        }
      </div>

      <!-- Advanced Analytics Layer (HIGH DENSITY) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10 items-start">
        <!-- Technical Velocity Chart -->
        <div class="lg:col-span-6 p-7 rounded-3xl bg-zinc-900/80 backdrop-blur-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
          <div class="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h3 class="text-xl font-black text-white tracking-tighter italic">Revenus & Ventes</h3>
              <p class="text-[9px] text-zinc-500 font-black tracking-[0.2em] uppercase mt-1">Performance Mensuelle</p>
            </div>
            <div class="flex bg-zinc-950 p-1 rounded-xl border border-white/5">
               <button class="px-4 py-2 rounded-lg text-[8px] font-black bg-white text-black shadow-2xl">REVENU</button>
               <button class="px-4 py-2 rounded-lg text-[8px] font-black text-zinc-500">TRAFFIC</button>
            </div>
          </div>
          <div class="h-[280px] w-full relative z-10">
            <canvas #salesChart></canvas>
          </div>
        </div>

        <!-- Node Performance Radar -->
        <div class="lg:col-span-3 p-7 rounded-3xl bg-zinc-900/80 backdrop-blur-3xl border border-white/5 shadow-2xl flex flex-col group">
          <h3 class="text-base font-black text-white mb-5 italic">Performance Boutique</h3>
          <div class="w-full h-[210px] relative mb-5">
            <canvas #performanceRadar></canvas>
          </div>
          <div class="space-y-3">
             <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span class="text-[9px] font-black text-zinc-500 uppercase">Commandes</span>
                <span class="text-xs font-black text-green-500 font-mono">99.98%</span>
             </div>
             <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span class="text-[9px] font-black text-zinc-500 uppercase">Délai moyen</span>
                <span class="text-xs font-black text-amber-500 font-mono">14ms</span>
             </div>
          </div>
        </div>

        <!-- LIVE OPERATIONS FEED (NEW) -->
        <div class="lg:col-span-3 p-7 rounded-3xl bg-zinc-900/80 backdrop-blur-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
          <div class="flex justify-between items-start mb-5">
             <div>
               <h3 class="text-lg font-black text-white italic leading-none">Activité Récente</h3>
               <p class="text-[8px] font-black text-zinc-600 uppercase tracking-[0.22em] mt-2">Notifications en temps réel</p>
             </div>
             <div class="ops-live-chip">
                <span></span>
                <strong>LIVE</strong>
             </div>
          </div>

          <div class="ops-signal-board">
            @for (op of operationsFeed.slice(0, 4); track op.id) {
              <div class="ops-signal-row group/op">
                <div class="ops-signal-pulse">
                  <span></span>
                </div>
                <div class="min-w-0">
                  <div class="ops-signal-meta">
                    <span>{{ op.time }}</span>
                    <em>{{ op.category }}</em>
                  </div>
                  <p>{{ op.event }}</p>
                  <strong>{{ op.meta }}</strong>
                </div>
              </div>
            } @empty {
              <div class="ops-empty-state">
                <lucide-icon name="activity" class="w-5 h-5"></lucide-icon>
                <span>Aucun signal actif</span>
              </div>
            }
          </div>

          <div class="ops-footer-strip">
            <span>{{ operationsFeed.length }} logs</span>
            <strong>SYNC_OK</strong>
          </div>
        </div>
      </div>

      <!-- Infrastructure Monitoring -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <!-- Resource Matrix Monitor -->
        <div class="lg:col-span-4 p-12 rounded-[2.5rem] bg-zinc-900/80 backdrop-blur-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
          <div class="flex justify-between items-center mb-12">
            <h3 class="text-2xl font-black text-white flex items-center gap-4 italic tracking-tighter">
               Promotions Actives
            </h3>
            <div class="flex items-center gap-2">
               <div class="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
               <span class="text-[9px] font-black text-zinc-500 uppercase tracking-widest">En cours</span>
            </div>
          </div>

          <div class="space-y-8">
            @for (stat of promotionMatrix; track stat.id) {
              <div class="space-y-6">
                <div class="flex justify-between items-end">
                   <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center overflow-hidden">
                         <img *ngIf="stat.image" [src]="stat.image" [alt]="stat.label" class="w-full h-full object-cover">
                         <lucide-icon *ngIf="!stat.image" name="tags" class="w-4 h-4 text-amber-500"></lucide-icon>
                      </div>
                      <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{{ stat.label }}</span>
                   </div>
                   <span class="text-sm font-black text-white font-mono">{{ stat.value }}%</span>
                </div>
                
                <!-- Segmented Pulse Bar -->
                <div class="flex gap-1.5 h-3">
                   @for (seg of [].constructor(20); track $index) {
                     <div [class]="($index / 20 * 100) < stat.value ? (stat.value > 80 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.4)]') : 'bg-zinc-950'" 
                          class="flex-1 rounded-[2px] transition-all duration-700">
                     </div>
                   }
                </div>
                
                <!-- Mini Telemetry Feed -->
                <div class="px-4 py-2 bg-zinc-950/50 rounded-lg border border-white/[0.02] overflow-hidden">
                   <p class="text-[8px] font-mono text-zinc-600 truncate animate-pulse">
                     [PROMO_ID: {{stat.id}}] {{stat.active ? 'ACTIVE' : 'PAUSED'}} | FIN: {{ stat.end || 'N/A' }} | POURCENTAGE: {{stat.value}}%
                   </p>
                </div>
              </div>
            } @empty {
              <div class="p-6 rounded-2xl bg-zinc-950/40 border border-white/5 text-center">
                <lucide-icon name="tags" class="w-8 h-8 text-zinc-700 mx-auto mb-3"></lucide-icon>
                <p class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Aucune promotion locale</p>
              </div>
            }
          </div>
          
          <button class="w-full mt-14 py-5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-amber-500 transition-all shadow-2xl">
             Gérer les promotions
          </button>
        </div>

        <!-- Enterprise Commandes Récentes Table -->
        <div class="lg:col-span-8 p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent shadow-2xl group">
          <div class="bg-zinc-950/90 backdrop-blur-3xl rounded-[23px] p-10 h-full border border-white/5 relative overflow-hidden">
            <!-- Background Glow -->
            <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-1000"></div>
            
            <div class="flex items-center justify-between mb-10 relative z-10">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                  <span class="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Temps Réel</span>
                </div>
                <h3 class="text-4xl font-black text-white tracking-tighter italic">Commandes Récentes</h3>
              </div>
              <button class="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 hover:border-amber-500/30 transition-all group/btn shadow-lg">
                 <span class="text-[10px] font-black uppercase tracking-widest">Exporter</span>
                 <lucide-icon name="download" class="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform"></lucide-icon>
              </button>
            </div>

            <div class="overflow-x-auto relative z-10">
              <table class="w-full border-separate border-spacing-y-3">
                <thead>
                  <tr class="text-left text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] bg-white/[0.02]">
                    <th class="py-4 px-6 rounded-l-xl">Commande</th>
                    <th class="py-4">Produit</th>
                    <th class="py-4">Statut</th>
                    <th class="py-4 text-right">Total</th>
                    <th class="py-4 rounded-r-xl"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (order of recentOrders; track order.id) {
                    <tr class="group/row cursor-pointer">
                      <td class="py-5 px-6 bg-white/[0.02] group-hover/row:bg-white/[0.04] rounded-l-2xl border-y border-l border-white/5 group-hover/row:border-amber-500/20 font-mono font-black text-amber-500 transition-all duration-300">
                        {{ order.id }}
                      </td>
                      <td class="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-white/5 font-black text-white tracking-tight transition-all duration-300">
                        <div class="flex items-center gap-4">
                          <div class="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shadow-lg group-hover/row:border-amber-500/30 transition-colors">
                            <img *ngIf="order.image" [src]="order.image" [alt]="order.product" class="w-full h-full object-cover">
                            <lucide-icon *ngIf="!order.image" name="package" class="w-5 h-5 text-zinc-600"></lucide-icon>
                          </div>
                          <div>
                            <p class="font-black text-white text-sm tracking-tight group-hover/row:text-amber-400 transition-colors">{{ order.product }}</p>
                            <p class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Quantité: {{ order.quantity }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-white/5 transition-all duration-300">
                        <span [class]="order.statusClass" class="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-inner">
                          {{ order.status }}
                        </span>
                      </td>
                      <td class="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-white/5 text-right font-mono font-black text-xl text-white tracking-tighter transition-all duration-300">
                        {{ order.value | currency:'MAD':'symbol':'1.2-2' }}
                      </td>
                      <td class="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.04] rounded-r-2xl border-y border-r border-white/5 px-6 text-right transition-all duration-300">
                        <button class="w-10 h-10 inline-flex items-center justify-center bg-zinc-900 border border-white/10 rounded-xl hover:border-amber-500 hover:text-amber-500 hover:bg-amber-500/10 transition-all hover:scale-110 shadow-lg">
                           <lucide-icon name="chevron-right" class="w-5 h-5"></lucide-icon>
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="py-20 text-center bg-white/[0.01] rounded-2xl border border-white/5 border-dashed">
                        <div class="w-20 h-20 mx-auto bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                          <lucide-icon name="package-open" class="w-8 h-8 text-zinc-600"></lucide-icon>
                        </div>
                        <h4 class="text-white font-black text-lg mb-2">Aucune commande</h4>
                        <p class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">En attente de nouvelles transactions</p>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
          </div>
          
             </div>

    <!-- FLAGSHIP COMMAND HUD (SPOTLIGHT) -->
    <div class="spotlight-overlay" [class.active]="isSpotlightOpen()" (click)="closeSpotlight()">
      <div class="spotlight-modal" (click)="$event.stopPropagation()">
        
        <!-- HUD Header -->
        <div class="spotlight-header">
          <div class="flex items-center px-10 py-8 border-b border-white/[0.03] gap-6">
            <lucide-icon name="search" class="w-10 h-10 text-amber-500"></lucide-icon>
            <input #searchInput type="text" class="spotlight-search" placeholder="ENTRER UNE COMMANDE..." (keyup)="filterSpotlight($event)">
            <div class="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
               <div class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
               RECHERCHE
            </div>
          </div>
        </div>

        <div class="flex h-[550px]">
          <!-- HUD Sidebar -->
          <div class="w-[320px] border-r border-white/[0.03] p-10 bg-black/20 flex flex-col justify-between">
            <div>
              <div class="mb-10">
                 <p class="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-6">Informations</p>
                 <div class="space-y-6">
                    <div class="flex items-center justify-between">
                       <span class="text-[10px] font-black text-zinc-400">SESSION_ID</span>
                       <span class="text-[10px] font-mono text-amber-500">{{ sessionId }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                       <span class="text-[10px] font-black text-zinc-400">STATUT</span>
                       <span class="text-[10px] font-mono text-green-500">EN LIGNE</span>
                    </div>
                 </div>
              </div>

              <div class="mb-10">
                 <p class="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-6">Accès Rapide</p>
                 <div class="space-y-2">
                    <button (click)="executeCommand({route: '/vendeur'})" class="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white text-[11px] font-black transition-all flex items-center gap-3 group">
                       <lucide-icon name="layout-dashboard" class="w-4 h-4 text-zinc-600 group-hover:text-amber-500"></lucide-icon> Dashboard
                    </button>
                    <button (click)="executeCommand({route: '/vendeur/inventaire'})" class="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white text-[11px] font-black transition-all flex items-center gap-3 group">
                       <lucide-icon name="package" class="w-4 h-4 text-zinc-600 group-hover:text-amber-500"></lucide-icon> Inventaire
                    </button>
                    <button class="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white text-[11px] font-black transition-all flex items-center gap-3 group">
                       <lucide-icon name="settings" class="w-4 h-4 text-zinc-600 group-hover:text-amber-500"></lucide-icon> Configuration Boutique
                    </button>
                 </div>
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-zinc-950 border border-white/5">
               <p class="text-[8px] font-mono text-zinc-700 leading-relaxed">
                 [BOUTIQUE]: EN LIGNE<br>
                 [PRODUITS]: SYNCHRONISÉS<br>
                 [COMMANDES]: PRÊTES
               </p>
            </div>
          </div>

          <!-- HUD Results -->
          <div class="flex-1 p-8 overflow-y-auto custom-scrollbar">
            <div class="spotlight-group-title mb-6">COMMANDES_DISPONIBLES</div>
            <div class="grid grid-cols-1 gap-3">
              @for (item of filteredSpotlightItems(); track item.title) {
                <button class="spotlight-item group text-left w-full" (click)="executeCommand(item)">
                  <div class="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center border border-white/5 group-hover:border-amber-500/40 group-hover:bg-amber-500/10 transition-all duration-500">
                    <lucide-icon [name]="item.icon" class="w-6 h-6 text-zinc-500 group-hover:text-amber-500 transition-colors"></lucide-icon>
                  </div>
                  <div class="flex-1 ml-6">
                    <p class="font-black text-white text-lg group-hover:text-amber-400 transition-colors tracking-tighter">{{ item.title }}</p>
                    <p class="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] group-hover:text-zinc-400 transition-colors">{{ item.description }}</p>
                  </div>
                  <div class="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    @for (key of item.shortcut.split(' '); track key) {
                      <span class="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-[10px] font-mono font-black text-zinc-500 group-hover:text-amber-500">{{ key }}</span>
                    }
                  </div>
                </button>
              }
            </div>
          </div>
        </div>

        <!-- HUD Footer -->
        <div class="px-10 py-6 border-t border-white/[0.03] flex justify-between items-center bg-black/40">
           <div class="flex gap-10">
              <div class="flex items-center gap-3">
                 <span class="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Navigation</span>
                 <div class="flex gap-1">
                    <span class="px-2 py-1 rounded bg-zinc-900 text-zinc-500 text-[8px] font-mono border border-white/5">↑↓</span>
                 </div>
              </div>
              <div class="flex items-center gap-3">
                 <span class="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Exécuter</span>
                 <div class="flex gap-1">
                    <span class="px-2 py-1 rounded bg-zinc-900 text-zinc-500 text-[8px] font-mono border border-white/5">ENTER</span>
                 </div>
              </div>
           </div>
           <p class="text-[9px] font-black text-amber-500/40 uppercase tracking-[0.5em] italic">Authorized Personnel Only</p>
        </div>
      </div>
    </div>

    <!-- ALERT CENTER -->
    <div class="notification-overlay" [class.active]="isNotificationOpen()" (click)="closeNotifications()">
      <aside class="notification-drawer" (click)="$event.stopPropagation()">
        <div class="p-8 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span class="text-[8px] font-black text-amber-500 uppercase tracking-[0.35em]">Notifications</span>
            </div>
            <h2 class="text-3xl font-black text-white tracking-tighter uppercase leading-none">Centre d'Alertes</h2>
            <p class="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-2">{{ notifications.length }} transmissions actives</p>
          </div>
          <button (click)="closeNotifications()" class="w-11 h-11 rounded-xl bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center">
            <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
          </button>
        </div>

        <div class="p-6 space-y-4 overflow-y-auto h-[calc(100%-128px)] custom-scrollbar">
          @for (notification of notifications; track notification.id) {
            <article class="relative p-5 rounded-2xl bg-zinc-950/70 border border-white/[0.06] hover:border-amber-500/30 transition-all overflow-hidden group"
                     [class.order-ticket-alert]="notification.ticket">
              <div class="absolute left-0 top-0 bottom-0 w-[3px]" [ngClass]="notification.color"></div>
              @if (notification.ticket) {
                <div class="ticket-scanline"></div>
              }
              <div class="flex items-start gap-4">
                <div class="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center" [ngClass]="notification.textColor">
                  <lucide-icon [name]="notification.icon" class="w-5 h-5"></lucide-icon>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-3 mb-2">
                    <span class="text-[8px] font-black uppercase tracking-[0.24em]" [ngClass]="notification.textColor">{{ notification.type }}</span>
                    <span class="text-[8px] font-black text-zinc-700 uppercase tracking-widest">{{ notification.time }}</span>
                  </div>
                  <h3 class="text-sm font-black text-white uppercase tracking-tight leading-tight group-hover:text-amber-400 transition-colors">{{ notification.title }}</h3>
                  <p class="text-[11px] font-bold text-zinc-500 leading-5 mt-2">{{ notification.desc }}</p>
                  @if (notification.ticket) {
                    <div class="order-ticket-body">
                      <div class="order-ticket-top">
                        <div>
                          <span>Référence</span>
                          <strong>{{ notification.ticket.orderNumber }}</strong>
                        </div>
                        <div>
                          <span>Montant ligne</span>
                          <strong>{{ notification.ticket.value | currency:'MAD':'symbol':'1.2-2' }}</strong>
                        </div>
                      </div>
                      <div class="order-ticket-product">
                        <div class="ticket-product-image">
                          <img *ngIf="notification.ticket.image" [src]="notification.ticket.image" [alt]="notification.ticket.product">
                          <lucide-icon *ngIf="!notification.ticket.image" name="package" class="w-5 h-5 text-zinc-600"></lucide-icon>
                        </div>
                        <div>
                          <span>Produit acheté</span>
                          <strong>{{ notification.ticket.product }}</strong>
                          <em>Quantité: {{ notification.ticket.quantity }} • PU: {{ notification.ticket.unitPrice | currency:'MAD':'symbol':'1.2-2' }}</em>
                        </div>
                      </div>
                      <div class="order-ticket-grid">
                        <div><span>Client</span><strong>{{ notification.ticket.clientName || 'Client ISGAARTI' }}</strong></div>
                        <div><span>Paiement</span><strong>{{ notification.ticket.paymentStatus || 'PAID' }}</strong></div>
                        <div><span>Ville</span><strong>{{ notification.ticket.shippingCity || 'N/A' }}</strong></div>
                        <div><span>Total commande</span><strong>{{ notification.ticket.orderTotal | currency:'MAD':'symbol':'1.2-2' }}</strong></div>
                      </div>
                      <div class="order-ticket-address">
                        <lucide-icon name="map-pin" class="w-3.5 h-3.5"></lucide-icon>
                        <span>{{ notification.ticket.shippingAddress || 'Adresse non renseignée' }} · {{ notification.ticket.shippingCountry || 'MA' }}</span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </article>
          }
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .bg-glow { position: fixed; top: -10%; left: -10%; width: 80vw; height: 80vh; background: radial-gradient(circle, rgba(251, 191, 36, 0.03) 0%, transparent 70%); z-index: -1; pointer-events: none; }
    .bg-grid { position: fixed; inset: 0; background-image: linear-gradient(to right, rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.01) 1px, transparent 1px); background-size: 100px 100px; z-index: -1; pointer-events: none; }
    #premium-particles { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 1; pointer-events: none; }

    /* COMMAND HUD */
    .spotlight-overlay { position: fixed; inset: 0; z-index: 100000; background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(40px); display: flex; justify-content: center; align-items: flex-start; padding-top: 10vh; opacity: 0; pointer-events: none; transition: 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .spotlight-overlay.active { opacity: 1; pointer-events: auto; }
    .spotlight-modal { width: 100%; max-width: 1100px; background: rgba(10, 10, 12, 0.98); backdrop-filter: blur(100px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 32px; box-shadow: 0 120px 300px rgba(0,0,0,1); transform: scale(0.95) translateY(-40px); transition: 0.8s cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden; }
    .spotlight-overlay.active .spotlight-modal { transform: scale(1) translateY(0); }
    .spotlight-search { flex: 1; border: none; background: transparent; font-size: 2.2rem; font-weight: 900; color: #fff; outline: none; letter-spacing: -2px; font-family: 'SF Mono', monospace; }
    .spotlight-search::placeholder { color: rgba(255,255,255,0.05); }
    .spotlight-group-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 5px; color: #3f3f46; font-weight: 900; }
    .spotlight-item { display: flex; align-items: center; padding: 16px 24px; border-radius: 24px; color: #fff; text-decoration: none; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid transparent; }
    .spotlight-item:hover { background: rgba(255, 255, 255, 0.02); border-color: rgba(255,255,255,0.05); transform: translateX(8px); }
      
    .custom-scrollbar::-webkit-scrollbar { width: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }

    /* NOTIFICATIONS */
    .notification-overlay { position: fixed; inset: 0; z-index: 100001; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); opacity: 0; pointer-events: none; transition: 0.5s; }
    .notification-overlay.active { opacity: 1; pointer-events: auto; }
    .notification-drawer { position: absolute; top: 0; right: 0; width: 100%; max-width: 500px; height: 100%; background: rgba(10, 10, 12, 0.98); backdrop-filter: blur(120px); border-left: 1px solid rgba(255, 255, 255, 0.08); box-shadow: -50px 0 100px rgba(0,0,0,0.5); transform: translateX(100%); transition: 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .notification-overlay.active .notification-drawer { transform: translateX(0); }
    .order-ticket-alert { background: linear-gradient(135deg, rgba(251,191,36,0.08), rgba(9,9,11,0.88) 42%, rgba(255,255,255,0.025)); border-color: rgba(251,191,36,0.18); box-shadow: 0 24px 60px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.05); }
    .ticket-scanline { position: absolute; left: 18px; right: 18px; top: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(251,191,36,0.8), transparent); opacity: 0.8; }
    .order-ticket-body { margin-top: 14px; padding: 14px; border-radius: 16px; background: rgba(0,0,0,0.28); border: 1px solid rgba(255,255,255,0.07); }
    .order-ticket-top { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-bottom: 12px; border-bottom: 1px dashed rgba(255,255,255,0.1); }
    .order-ticket-top div, .order-ticket-grid div { min-width: 0; }
    .order-ticket-top span, .order-ticket-product span, .order-ticket-grid span { display: block; color: rgba(255,255,255,0.3); font-size: 7px; font-weight: 950; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 4px; }
    .order-ticket-top strong { display: block; color: #fbbf24; font-size: 10px; font-weight: 950; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .order-ticket-product { display: grid; grid-template-columns: 54px 1fr; gap: 12px; align-items: center; padding: 14px 0; border-bottom: 1px dashed rgba(255,255,255,0.1); }
    .ticket-product-image { width: 54px; height: 54px; border-radius: 13px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #09090b; border: 1px solid rgba(255,255,255,0.08); }
    .ticket-product-image img { width: 100%; height: 100%; object-fit: cover; }
    .order-ticket-product strong { display: block; color: white; font-size: 12px; font-weight: 950; line-height: 1.1; text-transform: uppercase; }
    .order-ticket-product em { display: block; color: #71717a; font-size: 8px; font-style: normal; font-weight: 900; margin-top: 5px; }
    .order-ticket-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-top: 12px; }
    .order-ticket-grid div { padding: 9px; border-radius: 10px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.055); }
    .order-ticket-grid strong { display: block; color: white; font-size: 9px; font-weight: 950; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .order-ticket-address { margin-top: 10px; display: flex; align-items: center; gap: 8px; color: rgba(251,191,36,0.86); font-size: 8px; font-weight: 900; line-height: 1.5; text-transform: uppercase; letter-spacing: 0.08em; }
    .ops-live-chip { display: flex; align-items: center; gap: 7px; padding: 7px 9px; border-radius: 999px; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.18); }
    .ops-live-chip span { width: 6px; height: 6px; border-radius: 50%; background: #fbbf24; box-shadow: 0 0 12px rgba(251,191,36,0.8); animation: pulse 1.6s infinite; }
    .ops-live-chip strong { color: #fbbf24; font-size: 7px; font-weight: 950; letter-spacing: 0.16em; }
    .ops-signal-board { display: grid; gap: 8px; }
    .ops-signal-row { display: grid; grid-template-columns: 28px 1fr; gap: 10px; align-items: center; min-height: 54px; padding: 9px; border-radius: 14px; background: rgba(0,0,0,0.24); border: 1px solid rgba(255,255,255,0.055); transition: 0.22s ease; }
    .ops-signal-row:hover { border-color: rgba(251,191,36,0.24); background: rgba(251,191,36,0.045); transform: translateX(2px); }
    .ops-signal-pulse { width: 28px; height: 28px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.06); }
    .ops-signal-pulse span { width: 7px; height: 7px; border-radius: 50%; background: #fbbf24; box-shadow: 0 0 12px rgba(251,191,36,0.75); }
    .ops-signal-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 3px; }
    .ops-signal-meta span, .ops-signal-meta em { color: rgba(255,255,255,0.26); font-size: 7px; font-weight: 950; letter-spacing: 0.14em; text-transform: uppercase; font-style: normal; }
    .ops-signal-meta em { color: #fbbf24; }
    .ops-signal-row p { color: white; font-size: 10px; font-weight: 950; line-height: 1.1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ops-signal-row strong { display: block; color: #52525b; font-size: 8px; font-weight: 800; font-family: monospace; margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ops-footer-strip { margin-top: 10px; padding: 9px 11px; display: flex; align-items: center; justify-content: space-between; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.055); }
    .ops-footer-strip span, .ops-footer-strip strong { color: rgba(255,255,255,0.34); font-size: 7px; font-weight: 950; letter-spacing: 0.14em; text-transform: uppercase; }
    .ops-footer-strip strong { color: #22c55e; }
    .ops-empty-state { min-height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: #3f3f46; border-radius: 16px; border: 1px dashed rgba(255,255,255,0.08); }
    .ops-empty-state span { font-size: 8px; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; }
  `]
})
export class VendeurDashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('salesChart') salesChartRef!: ElementRef;
  @ViewChild('performanceRadar') radarRef!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  private authService = inject(AuthService);
  private vendeurService = inject(VendeurService);
  private router = inject(Router);
  Math = Math;
  private salesChart?: Chart;
  private radarChart?: Chart;
  private dashboardRefreshTimer?: ReturnType<typeof setInterval>;

  vendorName = computed(() => {
    const user = this.authService.currentUser();
    return user?.email?.split('@')[0] || 'Vendeur';
  });

  sessionId = Math.random().toString(36).substr(2, 6).toUpperCase();
  isSpotlightOpen = signal(false);
  isNotificationOpen = signal(false);

  notifications: Array<{ id: any; type: string; title: string; desc: string; time: string; icon: string; color: string; textColor: string; ticket?: any }> = [
    { id: 1, type: 'CRITICAL', title: 'Alerte Thermique Node Beta', desc: 'Le Node Beta-04 approche de la limite critique (52°C). Optimisation recommandée.', time: '2m ago', icon: 'thermometer', color: 'bg-red-500', textColor: 'text-red-500' },
    { id: 2, type: 'LOGISTICS', title: 'Nouvelle Commande ORD-9905', desc: 'Nexus Solutions a commandé 5x Core Processor V3. Préparation requise.', time: '15m ago', icon: 'shopping-cart', color: 'bg-amber-500', textColor: 'text-amber-500' },
    { id: 3, type: 'UPDATE', title: 'Sync Système Terminée', desc: 'Tous les nodes locaux sont synchronisés avec le cloud global IsgaArti.', time: '1h ago', icon: 'refresh-cw', color: 'bg-green-500', textColor: 'text-green-500' }
  ];

  kpis = [
    { title: 'Revenu Net', value: '0', prefix: '', suffix: ' MAD', trend: 0, icon: 'wallet', colorClass: 'kpi-gold' },
    { title: 'Expéditions', value: '0', prefix: '', suffix: '', trend: 0, icon: 'truck', colorClass: 'kpi-blue' },
    { title: 'Promotions', value: '0', prefix: '', suffix: '', trend: 0, icon: 'tags', colorClass: 'kpi-green' },
    { title: 'Stock Node', value: '0', prefix: '', suffix: '', trend: 0, icon: 'box', colorClass: 'kpi-purple' }
  ];

  promotionMatrix: Array<{ id: number; label: string; value: number; image?: string; active: boolean; end?: string }> = [];

  recentOrders: Array<{ id: string; product: string; image?: string; quantity: number; status: string; statusClass: string; value: number }> = [];

  allSpotlightItems = [
    { title: 'Déployer un Article', description: 'Ajouter un nouveau node hardware', icon: 'plus', shortcut: 'N P', route: '/vendeur/inventaire' },
    { title: 'Gestion des Commandes', description: 'Préparation, emballage, expédition et livraison', icon: 'truck', shortcut: 'G C', route: '/vendeur/commandes' },
    { title: 'Partenaires Node', description: 'Gérer les fournisseurs critiques', icon: 'users', shortcut: 'G F', route: '/vendeur/fournisseurs' },
    { title: 'Campagnes Locales', description: 'Lancer des promotions flash', icon: 'tags', shortcut: 'G L', route: '/vendeur/promotions' }
  ];
  filteredSpotlightItems = signal([...this.allSpotlightItems]);

  operationsFeed: Array<{ id: any; time: string; event: string; category: string; meta: string }> = [];
  revenueSeries = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  ngAfterViewInit() {
    this.loadDashboard();
    this.dashboardRefreshTimer = setInterval(() => this.loadDashboard(false), 30000);
  }

  ngOnDestroy() {
    this.salesChart?.destroy();
    this.radarChart?.destroy();
    if (this.dashboardRefreshTimer) clearInterval(this.dashboardRefreshTimer);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.toggleSpotlight();
    }
    if (event.key === 'Escape') {
      this.closeSpotlight();
      this.closeNotifications();
    }
  }


  toggleSpotlight() {
    this.isSpotlightOpen.set(!this.isSpotlightOpen());
    if (this.isSpotlightOpen()) {
      this.isNotificationOpen.set(false);
      setTimeout(() => this.searchInput.nativeElement.focus(), 100);
    }
  }

  closeSpotlight() { this.isSpotlightOpen.set(false); }

  executeCommand(item: any) {
    if (item.route) {
      this.router.navigate([item.route]);
      this.closeSpotlight();
    }
  }

  toggleNotifications() {
    this.isNotificationOpen.set(!this.isNotificationOpen());
    if (this.isNotificationOpen()) this.loadDashboard(false);
    if (this.isNotificationOpen()) this.isSpotlightOpen.set(false);
  }

  closeNotifications() { this.isNotificationOpen.set(false); }

  filterSpotlight(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredSpotlightItems.set(
      this.allSpotlightItems.filter(item =>
        item.title.toLowerCase().includes(term) || item.description.toLowerCase().includes(term)
      )
    );
  }

  loadDashboard(rebuildCharts = true) {
    this.vendeurService.getDashboard().subscribe({
      next: (data) => {
        this.applyDashboardData(data);
        if (rebuildCharts) this.initCharts();
      },
      error: () => this.initCharts()
    });
  }

  applyDashboardData(data: VendeurDashboardData) {
    const kpis = data.kpis || {} as any;
    this.kpis = [
      { title: 'Revenu Net', value: this.formatCompact(kpis.revenue || 0), prefix: '', suffix: ' MAD', trend: kpis.revenue ? 12 : 0, icon: 'wallet', colorClass: 'kpi-gold' },
      { title: 'Expéditions', value: String(kpis.shipments || 0), prefix: '', suffix: '', trend: kpis.shipments ? 8 : 0, icon: 'truck', colorClass: 'kpi-blue' },
      { title: 'Promotions', value: String(kpis.activePromotions || 0), prefix: '', suffix: '', trend: kpis.activePromotions ? 6 : 0, icon: 'tags', colorClass: 'kpi-green' },
      { title: 'Stock Node', value: this.formatCompact(kpis.stock || 0), prefix: '', suffix: '', trend: (kpis.stock || 0) > 0 ? 4 : 0, icon: 'box', colorClass: 'kpi-purple' }
    ];

    this.promotionMatrix = (data.promotions || []).map(promo => ({
      id: promo.id,
      label: promo.productName || promo.nom || 'Promotion',
      value: Number(promo.pourcentage || 0),
      image: promo.productImage,
      active: !!promo.active,
      end: promo.dateFin
    }));

    this.recentOrders = (data.products || []).map(product => ({
      id: `PRD-${product.id}`,
      product: product.nom,
      image: product.image,
      quantity: Number(product.stock || 0),
      status: Number(product.stock || 0) > 0 ? 'Disponible' : 'Rupture',
      statusClass: Number(product.stock || 0) > 0
        ? 'bg-green-500/10 text-green-500 border-green-500/20'
        : 'bg-red-500/10 text-red-500 border-red-500/20',
      value: Number(product.prix || 0) * Number(product.stock || 0)
    }));

    this.operationsFeed = (data.activity || []).map(item => ({
      id: item.id,
      time: this.formatActivityTime(item.time),
      event: item.event,
      category: item.category,
      meta: String(item.meta || 'SYNC: OK')
    }));

    const orderTickets = (data.shipments || [])
      .filter(order => String(order.paymentStatus || order.status || '').toUpperCase().includes('PAID') || String(order.status || '').toUpperCase().includes('PAYEE'))
      .slice(0, 4)
      .map((order, index) => ({
        id: `ORDER-${order.id || index}`,
        type: 'NOUVELLE COMMANDE',
        title: `Commande ${order.orderNumber || order.id}`,
        desc: `${order.clientName || 'Client'} a acheté ${order.product} x${order.quantity}. Préparation vendeur requise.`,
        time: this.formatActivityTime(order.createdAt),
        icon: 'shopping-cart',
        color: 'bg-amber-500',
        textColor: 'text-amber-500',
        ticket: order
      }));

    const activityNotifications = this.operationsFeed.slice(0, 5).map((item, index) => ({
      id: index + 1,
      type: item.category,
      title: item.event,
      desc: item.meta,
      time: item.time,
      icon: item.category === 'PROMO' ? 'tags' : item.category === 'ORDER' ? 'shopping-cart' : item.category === 'SHIP' ? 'truck' : 'package',
      color: item.category === 'PROMO' ? 'bg-amber-500' : item.category === 'ORDER' ? 'bg-amber-500' : item.category === 'SHIP' ? 'bg-green-500' : 'bg-blue-500',
      textColor: item.category === 'PROMO' ? 'text-amber-500' : item.category === 'ORDER' ? 'text-amber-500' : item.category === 'SHIP' ? 'text-green-500' : 'text-blue-500'
    }));
    this.notifications = [...orderTickets, ...activityNotifications].slice(0, 7);

    this.revenueSeries = (data.revenueSeries || this.revenueSeries).map(Number);
  }

  formatCompact(value: number) {
    return new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
  }

  formatActivityTime(value: string) {
    if (!value) return 'LIVE';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  initCharts() {
    this.salesChart?.destroy();
    this.radarChart?.destroy();

    this.salesChart = new Chart(this.salesChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['J-10', 'J-9', 'J-8', 'J-7', 'J-6', 'J-5', 'J-4', 'J-3', 'J-2', 'J-1', 'Now'],
        datasets: [{
          label: 'Revenue',
          data: this.revenueSeries,
          borderColor: '#fbbf24',
          backgroundColor: 'rgba(251, 191, 36, 0.03)',
          borderWidth: 6,
          tension: 0.45,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 10,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#71717a', font: { weight: 'bold' } } },
          y: { grid: { color: 'rgba(255,255,255,0.03)' }, border: { dash: [4, 4] }, ticks: { color: '#71717a' } }
        }
      }
    });

    const stock = Number((this.kpis.find(kpi => kpi.title === 'Stock Node')?.value || '0').toString().replace(/\D/g, '')) || 0;
    const promoLoad = Math.min(100, this.promotionMatrix.length * 18);
    const productLoad = Math.min(100, this.recentOrders.length * 12);

    this.radarChart = new Chart(this.radarRef.nativeElement, {
      type: 'radar',
      data: {
        labels: ['Uptime', 'Security', 'Throughput', 'Efficiency', 'Latency', 'Reliability'],
        datasets: [{
          label: 'Active Node',
          data: [Math.min(98, productLoad + 30), Math.min(96, promoLoad + 25), Math.min(100, stock), Math.min(95, productLoad + promoLoad), Math.max(15, 100 - promoLoad), Math.min(96, this.operationsFeed.length * 8 + 40)],
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          borderColor: '#fbbf24',
          borderWidth: 2,
          pointBackgroundColor: '#fbbf24'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            angleLines: { color: 'rgba(255,255,255,0.05)' },
            grid: { color: 'rgba(255,255,255,0.05)' },
            pointLabels: { color: '#a1a1aa', font: { size: 9, weight: 'bold' } },
            ticks: { display: false }
          }
        }
      }
    });
  }
}
