import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, HostListener, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import Chart from 'chart.js/auto';
import { AdminService } from '../../../core/services/admin.service';
import { ProductService } from '../../../core/services/product.service';
import { VendeurBackgroundComponent } from '../../../shared/components/vendeur-background/vendeur-background.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, VendeurBackgroundComponent],
  providers: [DatePipe, CurrencyPipe],
  template: `
    <app-vendeur-background [showParticles]="true" [showNebula]="false"></app-vendeur-background>

    <div class="container-fluid py-8 relative z-10 max-w-[1700px] mx-auto px-[3%]">
      
      <div class="dashboard-header">
        <div class="flex items-center gap-4">
          <div class="w-[70px] h-[70px] rounded-[18px] bg-white/5 border border-white/10 flex justify-center items-center text-white text-3xl shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <lucide-icon name="command"></lucide-icon>
          </div>
          <div>
            <h1 class="text-4xl font-bold text-white mb-1 tracking-tight">Tableau de Bord Global</h1>
            <div class="flex items-center gap-3">
              <p class="text-light-gray mb-0 text-base">Vision d'ensemble et pilotage commercial de pointe.</p>
              <span class="cmd-k-hint"><lucide-icon name="command" class="w-3 h-3 inline -mt-1"></lucide-icon> K pour chercher</span>
            </div>
          </div>
        </div>
        
        <div class="live-clock" (click)="toggleSpotlight()">
          <div>
            <div class="text-light-gray text-[0.7rem] uppercase tracking-[1px] font-bold mb-[-3px] text-right">Heure Locale</div>
            <div class="time">{{ currentTime() }}</div>
          </div>
        </div>
      </div>

      <div class="quick-control-bar">
        <div class="flex gap-6">
          <div class="qc-item">
            <div class="qc-lbl">Commandes Finalisées</div>
            <div class="qc-val">{{ stats().nbCommandesMois }} <span class="text-green-500 text-sm font-semibold ml-2">Ce mois</span></div>
          </div>
          <div class="qc-item">
            <div class="qc-lbl">Produits Écoulés</div>
            <div class="qc-val">{{ stats().produitsVendus }} <span class="text-gold text-sm font-semibold ml-2"><lucide-icon name="package" class="w-4 h-4"></lucide-icon></span></div>
          </div>
          <div class="qc-item border-0">
            <div class="qc-lbl">Retours / Annulations</div>
            <div class="qc-val text-red-500">{{ stats().nbAnnulations }} <span class="text-light-gray text-sm font-normal ml-2">Dossiers</span></div>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="shop-toggle-wrapper">
            <span class="qc-lbl mb-0 mr-2">Boutique</span>
            <label class="ios-switch">
              <input type="checkbox" [checked]="isStoreOpen()" (change)="toggleStore()">
              <span class="slider"></span>
            </label>
            <span class="ml-2 font-bold text-xs tracking-wider" [ngClass]="isStoreOpen() ? 'text-green-500' : 'text-red-500'">
              {{ isStoreOpen() ? 'OUVERTE' : 'FERMÉE' }}
            </span>
          </div>
          
          <button class="admin-alert-trigger" type="button" (click)="toggleAdminAlerts()" title="Centre de Notifications">
            <lucide-icon name="bell" class="w-5 h-5"></lucide-icon>
            <span class="alert-count">{{ adminAlertCount() }}</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        
        <div class="bento-card">
          <div class="kpi-header">
            <span class="kpi-title">Revenu Mensuel</span>
            <div class="kpi-icon icon-gold"><lucide-icon name="banknote"></lucide-icon></div>
          </div>
          <div class="kpi-value font-monospace text-gold">{{ stats().revenuMensuel | currency:'MAD':'symbol':'1.0-0' }}</div>
          <div class="flex justify-between items-end mt-3 mb-1">
            <span class="text-light-gray text-xs">Objectif: {{ stats().objectifMensuel | currency:'MAD':'symbol':'1.0-0' }}</span>
            <span class="text-white font-bold text-sm">{{ getObjectifPercentage() | number:'1.1-1' }}%</span>
          </div>
          <div class="goal-progress-bg">
            <div class="goal-progress-fill" [style.width.%]="getObjectifPercentage()"></div>
          </div>
        </div>

        <div class="bento-card">
          <div class="kpi-header">
            <span class="kpi-title">Panier Moyen</span>
            <div class="kpi-icon icon-green"><lucide-icon name="shopping-cart"></lucide-icon></div>
          </div>
          <div class="kpi-value font-monospace">{{ stats().panierMoyen | currency:'MAD':'symbol':'1.2-2' }}</div>
          <div class="kpi-trend text-green-500"><lucide-icon name="trending-up" class="w-4 h-4"></lucide-icon> Index de Valeur</div>
        </div>

        <div class="bento-card">
          <div class="kpi-header">
            <span class="kpi-title">Inventaire Global</span>
            <div class="kpi-icon icon-blue"><lucide-icon name="package"></lucide-icon></div>
          </div>
          <div class="kpi-value font-monospace">{{ stats().totalProduits }}</div>
          <div class="kpi-trend text-light-gray"><lucide-icon name="layers" class="w-4 h-4"></lucide-icon> {{ stats().totalCategories }} Segments</div>
        </div>

        <div class="bento-card">
          <div class="kpi-header">
            <span class="kpi-title">Comptes Clients</span>
            <div class="kpi-icon icon-purple"><lucide-icon name="users"></lucide-icon></div>
          </div>
          <div class="kpi-value font-monospace">{{ stats().totalUtilisateurs }}</div>
          <div class="kpi-trend text-green-500"><lucide-icon name="user-plus" class="w-4 h-4"></lucide-icon> Inscriptions actives</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div class="lg:col-span-5 bento-card">
          <h3 class="card-title-premium">Revenu Réel Mensuel</h3>
          <div class="h-[280px] w-full relative">
            <canvas #lineChart></canvas>
          </div>
        </div>
        <div class="lg:col-span-3 bento-card">
          <h3 class="card-title-premium">Répartition du Catalogue</h3>
          <div class="h-[280px] w-full flex justify-center relative">
            <canvas #doughnutChart></canvas>
          </div>
        </div>
        <div class="lg:col-span-4 bento-card">
          <h3 class="card-title-premium">Ventes par Marchand</h3>
          <p class="text-[9px] text-zinc-500 font-black tracking-[0.22em] uppercase mb-4">Quantités vendues par marchand</p>
          <div class="h-[240px] w-full relative">
            <canvas #vendorChart></canvas>
          </div>
          <div class="vendor-mini-list">
            @for (vendor of vendorLeaders; track vendor.name) {
              <div>
                <span>{{ vendor.name }}</span>
                <strong>{{ vendor.purchases }} ventes · {{ vendor.revenue | currency:'MAD':'symbol':'1.0-0' }}</strong>
              </div>
            } @empty {
              <div><span>Aucune vente marchand</span><strong>En attente des commandes payées</strong></div>
            }
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-2 p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-white/5 shadow-2xl group">
          <div class="bg-zinc-950/95 backdrop-blur-3xl rounded-[23px] h-full border border-white/5 flex flex-col p-8">
            <div class="flex justify-between items-center mb-8">
              <div>
                <h3 class="text-2xl font-bold text-white tracking-tight">Flux des Produits Récents</h3>
                <p class="text-xs text-zinc-500 mt-1">Dernières additions au catalogue</p>
              </div>
              <div class="px-4 py-1.5 bg-zinc-900 border border-white/10 rounded-full flex items-center gap-2 shadow-inner">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span class="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">En Direct</span>
              </div>
            </div>
            
            <div class="overflow-x-auto flex-grow h-[320px] custom-scrollbar">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="text-left border-b border-white/10">
                    <th class="py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Produit</th>
                    <th class="py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Référence</th>
                    <th class="py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Catégorie</th>
                    <th class="py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of derniersLivres; track item.id) {
                    <tr class="group/row hover:bg-white/[0.02] border-b border-white/5 transition-colors cursor-pointer">
                      <td class="py-5">
                        <div class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center group-hover/row:border-gold/30 transition-colors">
                            <lucide-icon name="package" class="w-4 h-4 text-zinc-400 group-hover/row:text-gold transition-colors"></lucide-icon>
                          </div>
                          <span class="font-bold text-white text-sm">{{ item.titre }}</span>
                        </div>
                      </td>
                      <td class="py-5 text-zinc-400 text-xs font-mono">
                        SKU-{{ item.id * 1024 }}
                      </td>
                      <td class="py-5">
                        <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-300">
                          {{ item.categorie }}
                        </span>
                      </td>
                      <td class="py-5 text-right font-mono font-bold text-white text-base">
                        {{ item.prix | currency:'MAD':'symbol':'1.0-0' }}
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="py-16 text-center">
                        <lucide-icon name="inbox" class="w-8 h-8 text-zinc-600 mx-auto mb-3"></lucide-icon>
                        <p class="text-xs text-zinc-500">Aucun produit récent</p>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-white/5 shadow-2xl group flex flex-col">
          <div class="bg-zinc-950/95 backdrop-blur-3xl rounded-[23px] h-full border border-white/5 flex flex-col p-6">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h3 class="text-xl font-bold text-white tracking-tight">Identity Matrix</h3>
                <p class="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Contrôle d'accès</p>
              </div>
              <div class="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                <lucide-icon name="users" class="text-zinc-400 w-5 h-5"></lucide-icon>
              </div>
            </div>
            
            <div class="flex-grow overflow-y-auto pr-2 grid grid-cols-1 gap-2 custom-scrollbar h-[320px]">
              @for (user of derniersUtilisateurs; track user.id) {
                <div class="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] hover:border-white/10 transition-all flex items-center justify-between group/user">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-inner relative" [ngClass]="user.roleClass">
                      {{ user.initials }}
                      <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-zinc-950"></div>
                    </div>
                    <div>
                      <div class="text-white font-bold text-sm truncate max-w-[110px]">{{ user.userName }}</div>
                      <div class="text-zinc-500 text-[10px] font-mono truncate max-w-[110px]">{{ user.email }}</div>
                    </div>
                  </div>
                  
                  <div class="flex flex-col items-end gap-2">
                    <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border" [ngClass]="user.badgeClass">
                      {{ user.roleLabel }}
                    </span>
                    @if (user.roleLabel === 'CLIENT') {
                      <button class="text-[9px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1" title="Promouvoir" (click)="openPromoModal(user)">
                        <lucide-icon name="arrow-up-circle" class="w-3 h-3"></lucide-icon> UPGRADE
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="admin-alert-scrim" [class.active]="isAdminAlertOpen()" (click)="closeAdminAlerts()"></div>
    <aside class="admin-alert-drawer" [class.open]="isAdminAlertOpen()">
      <div class="drawer-glow"></div>
      <div class="admin-alert-head">
        <div>
          <div class="admin-alert-kicker">
            <span></span>
            <strong>Centre de Notifications</strong>
          </div>
          <h3>Centre d'Alertes</h3>
          <p>Demandes vendeurs et achats payés arrivent ici comme des tickets opérationnels.</p>
        </div>
        <button class="drawer-close" type="button" (click)="closeAdminAlerts()" title="Fermer">
          <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
        </button>
      </div>

      <div class="admin-alert-metrics">
        <div><span>À valider</span><strong>{{ pendingVendorRequests.length }}</strong></div>
        <div><span>Payées</span><strong>{{ stats().totalCommandesPayees }}</strong></div>
        <div><span>Revenu</span><strong>{{ stats().revenuTotal | currency:'MAD':'symbol':'1.0-0' }}</strong></div>
      </div>

      <div class="admin-alert-feed">
        @for (vendor of pendingVendorRequests; track vendor.id) {
          <article class="admin-vendor-ticket">
            <div class="ticket-beam vendor"></div>
            <div class="purchase-ticket-top">
              <div>
                <span>Nouvelle vitrine vendeur</span>
                <strong>REQ-{{ vendor.id }}</strong>
              </div>
              <em>À valider</em>
            </div>
            <div class="purchase-ticket-main">
              <div class="vendor-request-avatar">
                {{ getInitials(vendor.nom) }}
              </div>
              <div class="min-w-0">
                <span>Compte bloqué jusqu'à validation</span>
                <strong>{{ vendor.nom || 'Nouveau vendeur' }}</strong>
                <p>{{ vendor.email }} · inscription partenaire marketplace</p>
              </div>
            </div>
            <div class="vendor-ticket-status">
              <lucide-icon name="lock-keyhole" class="w-4 h-4"></lucide-icon>
              <span>Connexion désactivée tant que l'admin n'a pas approuvé.</span>
            </div>
            <div class="vendor-ticket-actions">
              <button type="button" class="reject" (click)="rejectPendingVendor(vendor.id)">
                <lucide-icon name="x" class="w-3.5 h-3.5"></lucide-icon>
                Rejeter
              </button>
              <button type="button" class="approve" (click)="approvePendingVendor(vendor.id)">
                <lucide-icon name="check" class="w-3.5 h-3.5"></lucide-icon>
                Accepter
              </button>
            </div>
          </article>
        }

        @for (alert of adminPurchaseAlerts; track alert.orderNumber + '-' + alert.product) {
          <article class="admin-purchase-ticket">
            <div class="ticket-beam"></div>
            <div class="purchase-ticket-top">
              <div>
                <span>Commande payée</span>
                <strong>{{ alert.orderNumber }}</strong>
              </div>
              <em>{{ formatAlertTime(alert.createdAt) }}</em>
            </div>
            <div class="purchase-ticket-main">
              <div class="purchase-product-img">
                <img *ngIf="alert.productImage" [src]="alert.productImage" [alt]="alert.product">
                <lucide-icon *ngIf="!alert.productImage" name="package" class="w-5 h-5 text-zinc-600"></lucide-icon>
              </div>
              <div class="min-w-0">
                <span>{{ alert.vendorName || 'Vendeur' }}</span>
                <strong>{{ alert.product }}</strong>
                <p>{{ alert.clientName || 'Client' }} · {{ alert.vendorEmail || 'vendeur@isgaarti' }} · {{ alert.shippingCity || 'Ville' }}, {{ alert.shippingCountry || 'MA' }}</p>
              </div>
            </div>
            <div class="purchase-ticket-grid">
              <div><span>Quantité</span><strong>{{ alert.quantity }}</strong></div>
              <div><span>Ligne</span><strong>{{ alert.value | currency:'MAD':'symbol':'1.0-0' }}</strong></div>
              <div><span>Total</span><strong>{{ alert.orderTotal | currency:'MAD':'symbol':'1.0-0' }}</strong></div>
              <div><span>Paiement</span><strong>{{ alert.paymentStatus || 'PAID' }}</strong></div>
            </div>
          </article>
        }

        @if (!pendingVendorRequests.length && !adminPurchaseAlerts.length) {
          <div class="admin-alert-empty">
            <lucide-icon name="check-circle" class="w-6 h-6"></lucide-icon>
            <span>Aucune alerte admin</span>
          </div>
        }
      </div>
    </aside>

    <div class="spotlight-overlay" [class.active]="isSpotlightOpen()" (click)="closeSpotlight()">
      <div class="spotlight-modal" (click)="$event.stopPropagation()">
        <div class="spotlight-header">
          <lucide-icon name="search" class="absolute left-[25px] top-1/2 -translate-y-1/2 w-6 h-6 text-gold"></lucide-icon>
          <input #searchInput type="text" class="spotlight-search" placeholder="Que souhaitez-vous faire ?" (keyup)="filterSpotlight($event)">
        </div>
        <div class="spotlight-results">
          <div class="spotlight-group-title">Raccourcis Globaux</div>
          
          @for (item of filteredSpotlightItems(); track item.title) {
            <button class="spotlight-item group w-full text-left" (click)="handleSpotlightAction(item.action)">
              <lucide-icon [name]="item.icon" class="w-5 h-5 text-zinc-400 group-hover:text-gold transition-colors"></lucide-icon>
              <span class="font-bold ml-3 flex-1">{{ item.title }}</span>
              <span class="spotlight-shortcut">{{ item.shortcut }}</span>
            </button>
          }
        </div>
      </div>
    </div>

    <div class="mac-overlay" [class.active]="selectedUserForPromo()">
      <div class="mac-dialog">
        <h3 class="text-white font-bold mb-1 text-xl">Autorisation Requise</h3>
        <p class="text-zinc-400 text-sm mb-6">Donner les droits d'administration</p>
        
        <div class="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-xl mb-6 text-white font-monospace">
          <lucide-icon name="user-check" class="text-blue-400 w-5 h-5"></lucide-icon> 
          <span class="font-bold">{{ selectedUserForPromo()?.userName }}</span>
        </div>
        
        <div class="bg-amber-500/10 border border-amber-500/20 border-l-4 border-l-amber-500 rounded-lg p-4 text-left flex gap-4 items-center mb-8">
          <lucide-icon name="alert-triangle" class="text-amber-500 w-8 h-8 flex-shrink-0"></lucide-icon>
          <p class="text-zinc-300 text-sm m-0">Vous allez accorder un accès <strong>Administrateur E-commerce</strong>. Cet utilisateur pourra modifier le système.</p>
        </div>
        
        <div class="flex gap-4">
          <button type="button" class="btn-dialog btn-cancel" (click)="closePromoModal()">Annuler</button>
          <button type="button" class="btn-dialog btn-success-mac" (click)="confirmPromo()">Accorder l'accès</button>
        </div>
      </div>
    </div>

    <!-- Categorie Modal -->
    <div class="mac-overlay" [class.active]="isCategorieModalOpen()">
      <div class="mac-dialog">
        <h3 class="text-white font-bold mb-1 text-xl">Nouvelle Catégorie</h3>
        <p class="text-zinc-400 text-sm mb-6">Ajouter une nouvelle catégorie au catalogue</p>
        
        <div class="mb-6">
          <input type="text" #categorieInput class="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:border-gold transition-colors" placeholder="Nom de la catégorie" />
        </div>
        
        <div class="flex gap-4">
          <button type="button" class="btn-dialog btn-cancel" (click)="closeCategorieModal()">Annuler</button>
          <button type="button" class="btn-dialog btn-success-mac" (click)="creerCategorie(categorieInput.value); categorieInput.value=''">Créer</button>
        </div>
      </div>
    </div>

    <!-- Promotion Modal -->
    <div class="mac-overlay" [class.active]="isPromotionModalOpen()">
      <div class="mac-dialog">
        <h3 class="text-white font-bold mb-1 text-xl">Lancer Promotion Globale</h3>
        <p class="text-zinc-400 text-sm mb-6">Appliquer une réduction sur tout le catalogue</p>
        
        <div class="mb-4">
          <input type="number" #promoPourcentageInput class="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:border-gold transition-colors" placeholder="Pourcentage (ex: 20)" />
        </div>
        <div class="mb-6">
          <input type="date" #promoDateInput class="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:border-gold transition-colors" />
        </div>
        
        <div class="flex gap-4">
          <button type="button" class="btn-dialog btn-cancel" (click)="closePromotionModal()">Annuler</button>
          <button type="button" class="btn-dialog btn-success-mac" (click)="lancerPromotion(promoPourcentageInput.value, promoDateInput.value); promoPourcentageInput.value=''; promoDateInput.value=''">Lancer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* GLOBAL VARIABLES & FOUNDATION */
    .bg-glow { position: fixed; top: -20%; right: -10%; width: 50vw; height: 50vh; background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%); z-index: 0; pointer-events: none; }
    .bg-grid { position: fixed; inset: 0; background-image: linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px); background-size: 50px 50px; z-index: 0; pointer-events: none; }
    #premium-particles { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 0; pointer-events: none; }
    
    .text-gold { color: #d4af37 !important; }
    .text-light-gray { color: #8a8a93 !important; }
    .font-monospace { font-family: 'SF Mono', Consolas, monospace !important; }

    /* DASHBOARD ELEMENTS */
    .dashboard-header { background: rgba(20, 20, 22, 0.6); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 35px 40px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4); position: relative; overflow: hidden; }
    .dashboard-header::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #d4af37, transparent); opacity: 0.5; }
    
    .live-clock { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 12px; display: flex; align-items: center; gap: 15px; cursor: pointer; transition: 0.3s; }
    .live-clock:hover { background: rgba(255,255,255,0.05); border-color: rgba(212, 175, 55, 0.4); }
    .live-clock .time { font-size: 1.3rem; font-weight: 800; color: #fff; letter-spacing: 2px; font-variant-numeric: tabular-nums; }
    
    .cmd-k-hint { background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; color: #a1a1aa; border: 1px solid rgba(255,255,255,0.1); margin-left: 15px; }

    /* BENTO CARDS */
    .bento-card { background: rgba(20, 20, 22, 0.65); backdrop-filter: saturate(200%) blur(50px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 25px; height: 100%; position: relative; overflow: hidden; box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.15), inset 0 0 20px rgba(255,255,255,0.02), 0 15px 30px rgba(0,0,0,0.3); transition: transform 0.4s, border-color 0.4s; }
    .bento-card:hover { transform: translateY(-5px); border-color: rgba(212, 175, 55, 0.3); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .card-title-premium { font-size: 0.85rem; font-weight: 700; color: #e4e4e7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1.5rem; }

    .kpi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .kpi-title { font-size: 0.8rem; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; }
    .kpi-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    
    .icon-gold { background: rgba(212, 175, 55, 0.1); color: #d4af37; border: 1px solid rgba(212, 175, 55, 0.2); }
    .icon-blue { background: rgba(10, 132, 255, 0.1); color: #0a84ff; border: 1px solid rgba(10, 132, 255, 0.2); }
    .icon-green { background: rgba(52, 199, 89, 0.1); color: #34c759; border: 1px solid rgba(52, 199, 89, 0.2); }
    .icon-purple { background: rgba(191, 90, 242, 0.1); color: #bf5af2; border: 1px solid rgba(191, 90, 242, 0.2); }

    .kpi-value { font-size: 2.2rem; font-weight: 800; letter-spacing: -1px; margin-bottom: 0.2rem; color: #fff; }
    .kpi-trend { font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }

    .goal-progress-bg { width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; margin-top: 15px; position: relative; }
    .goal-progress-fill { height: 100%; background: linear-gradient(90deg, #d4af37, #fceabb); border-radius: 10px; box-shadow: 0 0 10px rgba(212, 175, 55, 0.8); transition: width 1.5s ease-in-out; }
    .admin-alert-trigger { position: relative; width: 52px; height: 52px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; color: #d4af37; background: radial-gradient(circle at 30% 20%, rgba(212,175,55,0.22), rgba(0,0,0,0.34)); border: 1px solid rgba(212,175,55,0.34); box-shadow: 0 16px 38px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.12); transition: 0.25s ease; }
    .admin-alert-trigger:hover { transform: translateY(-2px); border-color: rgba(212,175,55,0.64); box-shadow: 0 18px 42px rgba(212,175,55,0.12); }
    .alert-count { position: absolute; right: -7px; top: -7px; min-width: 24px; height: 24px; padding: 0 6px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; background: #d4af37; color: #060606; border: 2px solid #121214; font-size: 0.66rem; font-weight: 950; font-family: 'SF Mono', Consolas, monospace; }
    .admin-alert-scrim { position: fixed; inset: 0; z-index: 70; background: rgba(0,0,0,0); backdrop-filter: blur(0); pointer-events: none; transition: 0.28s ease; }
    .admin-alert-scrim.active { background: rgba(0,0,0,0.44); backdrop-filter: blur(10px); pointer-events: auto; }
    .admin-alert-drawer { position: fixed; top: 18px; right: 18px; bottom: 18px; z-index: 80; width: min(480px, calc(100vw - 28px)); padding: 22px; border-radius: 28px; background: linear-gradient(145deg, rgba(18,18,20,0.96), rgba(5,5,6,0.98)); border: 1px solid rgba(212,175,55,0.18); box-shadow: -36px 0 90px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07); transform: translateX(calc(100% + 30px)); transition: transform 0.36s cubic-bezier(.2,.8,.2,1); overflow: hidden; display: flex; flex-direction: column; }
    .admin-alert-drawer.open { transform: translateX(0); }
    .drawer-glow { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 20% 0%, rgba(212,175,55,0.18), transparent 34%), radial-gradient(circle at 100% 38%, rgba(10,132,255,0.1), transparent 28%); }
    .admin-alert-head { position: relative; display: grid; grid-template-columns: 1fr auto; align-items: flex-start; gap: 18px; padding-bottom: 18px; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .admin-alert-kicker { display: flex; align-items: center; gap: 9px; margin-bottom: 8px; }
    .admin-alert-kicker span { width: 7px; height: 7px; border-radius: 50%; background: #d4af37; box-shadow: 0 0 14px rgba(212,175,55,0.8); animation: pulse 1.6s infinite; }
    .admin-alert-kicker strong { color: #d4af37; font-size: 0.48rem; font-weight: 950; letter-spacing: 0.34em; text-transform: uppercase; }
    .admin-alert-head h3 { color: white; font-size: 1.55rem; font-weight: 950; letter-spacing: -0.04em; text-transform: uppercase; line-height: 1; }
    .admin-alert-head p { color: #71717a; font-size: 0.72rem; font-weight: 800; margin-top: 8px; }
    .drawer-close { width: 40px; height: 40px; border-radius: 13px; display: inline-flex; align-items: center; justify-content: center; color: #a1a1aa; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); transition: 0.2s ease; }
    .drawer-close:hover { color: white; border-color: rgba(212,175,55,0.28); background: rgba(212,175,55,0.08); }
    .admin-alert-metrics { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; padding: 16px 0; }
    .admin-alert-metrics div { padding: 12px; border-radius: 14px; background: rgba(0,0,0,0.28); border: 1px solid rgba(255,255,255,0.07); }
    .admin-alert-metrics span { display: block; color: #71717a; font-size: 0.48rem; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 6px; }
    .admin-alert-metrics strong { display: block; color: white; font-family: 'SF Mono', Consolas, monospace; font-size: 0.92rem; font-weight: 950; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .admin-alert-feed { position: relative; display: flex; flex-direction: column; gap: 14px; flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 2px 0 18px; scrollbar-width: none; -ms-overflow-style: none; }
    .admin-alert-feed::-webkit-scrollbar { width: 0; height: 0; display: none; }
    .admin-alert-feed::-webkit-scrollbar-track { background: transparent; }
    .admin-alert-feed::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(212,175,55,0.48), rgba(255,255,255,0.12)); border-radius: 999px; }
    .admin-alert-feed::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.68); }
    .admin-purchase-ticket, .admin-vendor-ticket { position: relative; flex: 0 0 auto; width: 100%; height: auto; padding: 14px; border-radius: 18px; background: rgba(0,0,0,0.28); border: 1px solid rgba(255,255,255,0.07); overflow: hidden; transition: 0.25s ease; }
    .admin-purchase-ticket:hover { border-color: rgba(212,175,55,0.32); transform: translateY(-2px); background: rgba(212,175,55,0.055); }
    .admin-vendor-ticket { border-color: rgba(245,158,11,0.2); background: linear-gradient(145deg, rgba(245,158,11,0.075), rgba(0,0,0,0.32)); }
    .admin-vendor-ticket:hover { border-color: rgba(245,158,11,0.48); transform: translateY(-2px); background: linear-gradient(145deg, rgba(245,158,11,0.12), rgba(0,0,0,0.34)); }
    .ticket-beam { position: absolute; left: 15px; right: 15px; top: 0; height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent); }
    .ticket-beam.vendor { background: linear-gradient(90deg, transparent, #f59e0b, rgba(255,255,255,0.7), transparent); }
    .purchase-ticket-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding-bottom: 11px; border-bottom: 1px dashed rgba(255,255,255,0.1); }
    .purchase-ticket-top span, .purchase-ticket-main span, .purchase-ticket-grid span { display: block; color: rgba(255,255,255,0.32); font-size: 0.45rem; font-weight: 950; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 4px; }
    .purchase-ticket-top strong { display: block; color: #d4af37; font-family: 'SF Mono', Consolas, monospace; font-size: 0.68rem; font-weight: 950; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .purchase-ticket-top em { color: #52525b; font-size: 0.48rem; font-style: normal; font-weight: 950; text-transform: uppercase; white-space: nowrap; }
    .purchase-ticket-main { display: grid; grid-template-columns: 46px 1fr; gap: 10px; align-items: center; padding: 10px 0; }
    .purchase-product-img { width: 46px; height: 46px; border-radius: 13px; overflow: hidden; background: #09090b; border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; }
    .purchase-product-img img { width: 100%; height: 100%; object-fit: cover; }
    .vendor-request-avatar { width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center; justify-content: center; color: #050506; background: linear-gradient(135deg, #f59e0b, #fff7ed); border: 1px solid rgba(245,158,11,0.4); font-size: 0.82rem; font-weight: 950; box-shadow: 0 14px 28px rgba(245,158,11,0.14); }
    .purchase-ticket-main strong { display: block; color: white; font-size: 0.78rem; font-weight: 950; line-height: 1.05; text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .purchase-ticket-main p { color: #71717a; font-size: 0.58rem; font-weight: 800; margin-top: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .vendor-ticket-status { min-height: 36px; display: flex; align-items: center; gap: 9px; padding: 9px 10px; border-radius: 12px; color: #fbbf24; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.16); }
    .vendor-ticket-status span { color: #d4d4d8; font-size: 0.58rem; font-weight: 850; line-height: 1.25; }
    .vendor-ticket-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
    .vendor-ticket-actions button { min-height: 38px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-size: 0.58rem; font-weight: 950; letter-spacing: 0.14em; text-transform: uppercase; transition: 0.2s ease; }
    .vendor-ticket-actions .reject { color: #f87171; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.18); }
    .vendor-ticket-actions .reject:hover { color: white; background: rgba(239,68,68,0.22); border-color: rgba(239,68,68,0.45); }
    .vendor-ticket-actions .approve { color: #050506; background: #f59e0b; border: 1px solid rgba(245,158,11,0.78); box-shadow: 0 12px 24px rgba(245,158,11,0.16); }
    .vendor-ticket-actions .approve:hover { background: #fbbf24; transform: translateY(-1px); }
    .purchase-ticket-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
    .purchase-ticket-grid div { padding: 8px; border-radius: 10px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.055); min-width: 0; }
    .purchase-ticket-grid strong { display: block; color: white; font-family: 'SF Mono', Consolas, monospace; font-size: 0.62rem; font-weight: 950; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .admin-alert-empty { grid-column: 1 / -1; min-height: 120px; display: flex; flex-direction: column; gap: 10px; align-items: center; justify-content: center; color: #52525b; border: 1px dashed rgba(255,255,255,0.09); border-radius: 18px; }
    .admin-alert-empty span { font-size: 0.62rem; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; }
    .vendor-mini-list { display: grid; gap: 8px; margin-top: 16px; }
    .vendor-mini-list div { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 11px; border-radius: 11px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.055); }
    .vendor-mini-list span { color: #f4f4f5; font-size: 0.72rem; font-weight: 900; text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .vendor-mini-list strong { color: #d4af37; font-size: 0.68rem; font-weight: 900; white-space: nowrap; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.45; transform: scale(0.72); } }
    @media (max-width: 720px) {
      .admin-alert-drawer { top: 10px; right: 10px; bottom: 10px; padding: 18px; border-radius: 22px; }
      .admin-alert-metrics { grid-template-columns: 1fr; }
      .admin-alert-feed { min-height: 0; }
    }

    /* QUICK CONTROLS */
    .quick-control-bar { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px 30px; margin-bottom: 30px; align-items: center; box-shadow: inset 0 0 20px rgba(255,255,255,0.01); }
    .qc-item { display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.1); padding-right: 25px; }
    .qc-item:last-child { border-right: none; padding-right: 0; }
    .qc-lbl { font-size: 0.75rem; color: #8a8a93; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 4px; }
    .qc-val { font-family: monospace; font-size: 1.4rem; font-weight: 800; color: #fff; display: flex; align-items: baseline; }
    
    .shop-toggle-wrapper { display: flex; align-items: center; background: rgba(255,255,255,0.03); padding: 8px 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
    .ios-switch { position: relative; display: inline-block; width: 44px; height: 24px; margin: 0 10px; }
    .ios-switch input { opacity: 0; width: 0; height: 0; }
    .ios-switch .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.1); transition: .4s; border-radius: 24px; border: 1px solid rgba(255,255,255,0.2); }
    .ios-switch .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; }
    .ios-switch input:checked + .slider { background-color: #34c759; border-color: #34c759; }
    .ios-switch input:checked + .slider:before { transform: translateX(20px); }

    .btn-action-gold { background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.4); color: #d4af37; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; transition: 0.3s; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; }
    .btn-action-gold:hover { background: #d4af37; color: #000; box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3); }

    /* TABLES & LISTS */
    .admin-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
    .admin-table th { color: #8a8a93; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; padding: 10px 20px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: left; }
    .admin-table td { background: rgba(255,255,255,0.02); padding: 16px 20px; color: #fff; vertical-align: middle; border-top: 1px solid rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.03); transition: 0.2s; }
    .admin-table tr td:first-child { border-left: 1px solid rgba(255,255,255,0.03); border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
    .admin-table tr td:last-child { border-right: 1px solid rgba(255,255,255,0.03); border-top-right-radius: 16px; border-bottom-right-radius: 16px; }
    .admin-table tr:hover td { background: rgba(212, 175, 55, 0.05); border-color: rgba(212, 175, 55, 0.2); transform: scale(1.002); }

    .status-badge { padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; color: #fff;}
    .status-success { background: rgba(52, 199, 89, 0.1); border: 1px solid rgba(52, 199, 89, 0.3); color: #34c759; }

    .user-avatar { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; box-shadow: inset 0 1px 1px rgba(255,255,255,0.2); }
    .bg-red-gradient { background: linear-gradient(135deg, #ff3b30, #ff2d55); }
    .bg-amber-gradient { background: linear-gradient(135deg, #ffcc00, #ff9500); }
    .bg-purple-gradient { background: linear-gradient(135deg, #bf5af2, #5e5ce6); }
    .bg-grey-gradient { background: linear-gradient(135deg, #4b4b4d, #2c2c2e); }
    .hover-bg:hover { background: rgba(255,255,255,0.04); }
    .btn-promote { background: rgba(52, 199, 89, 0.1); border: 1px solid rgba(52, 199, 89, 0.3); color: #34c759; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
    .btn-promote:hover { background: #34c759; color: #000; transform: scale(1.1); }
    .btn-ghost-premium { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 12px; border-radius: 12px; transition: 0.2s; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
    .btn-ghost-premium:hover { background: rgba(212, 175, 55, 0.1); border-color: rgba(212, 175, 55, 0.3); color: #d4af37; transform: translateY(-2px); }

    /* SPOTLIGHT */
    .spotlight-overlay { position: fixed; inset: 0; z-index: 100000; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: flex-start; padding-top: 10vh; opacity: 0; pointer-events: none; transition: 0.2s; }
    .spotlight-overlay.active { opacity: 1; pointer-events: auto; }
    .spotlight-modal { width: 100%; max-width: 650px; background: rgba(25, 25, 30, 0.85); backdrop-filter: blur(40px) saturate(200%); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05); transform: scale(0.95); transition: 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); overflow: hidden; }
    .spotlight-overlay.active .spotlight-modal { transform: scale(1); }
    .spotlight-search { width: 100%; border: none; background: transparent; padding: 25px 25px 25px 60px; font-size: 1.2rem; color: #fff; outline: none; }
    .spotlight-search::placeholder { color: #8a8a93; }
    .spotlight-header { position: relative; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .spotlight-results { padding: 10px; max-height: 350px; overflow-y: auto; }
    .spotlight-group-title { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #8a8a93; font-weight: 700; padding: 10px 15px; }
    .spotlight-item { display: flex; align-items: center; gap: 15px; padding: 12px 15px; border-radius: 12px; color: #fff; text-decoration: none; transition: 0.1s; cursor: pointer; }
    .spotlight-item:hover { background: rgba(212, 175, 55, 0.15); }
    .spotlight-shortcut { font-family: monospace; font-size: 0.7rem; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 6px; color: #a1a1aa; }

    /* MAC OVERLAY DIALOG */
    .mac-overlay { position: fixed; inset: 0; z-index: 10000; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(15px); display: flex; justify-content: center; align-items: center; opacity: 0; pointer-events: none; transition: 0.3s; }
    .mac-overlay.active { opacity: 1; pointer-events: auto; }
    .mac-dialog { background: rgba(20, 20, 25, 0.95); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 24px; padding: 40px; width: 100%; max-width: 450px; text-align: center; }
    .btn-dialog { flex: 1; padding: 14px; border-radius: 14px; font-weight: 700; border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); font-size: 0.95rem; }
    .btn-cancel { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
    .btn-cancel:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); border-color: rgba(255,255,255,0.3); }
    .btn-success-mac { background: linear-gradient(135deg, #34c759, #28a745); color: #000; box-shadow: 0 5px 15px rgba(52, 199, 89, 0.3); }
    .btn-success-mac:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(52, 199, 89, 0.5); filter: brightness(1.1); }
    
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
  `]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lineChart') lineChartRef!: ElementRef;
  @ViewChild('doughnutChart') doughnutChartRef!: ElementRef;
  @ViewChild('vendorChart') vendorChartRef!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  lineChart: Chart | null = null;
  doughnutChart: Chart | null = null;
  vendorChart: Chart | null = null;

  // Signals for state management
  currentTime = signal<string>('');
  isStoreOpen = signal<boolean>(true);
  isSpotlightOpen = signal<boolean>(false);
  isAdminAlertOpen = signal<boolean>(false);
  selectedUserForPromo = signal<any | null>(null);

  private timeInterval: any;
  private adminService = inject(AdminService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private isViewReady = false;

  // Stats Signal
  stats = signal({
    nbCommandesMois: 0,
    produitsVendus: 0,
    nbAnnulations: 0,
    revenuMensuel: 0,
    objectifMensuel: 1,
    panierMoyen: 0,
    totalProduits: 0,
    totalCategories: 0,
    totalUtilisateurs: 0,
    historiquePrixMoyen: [] as number[],
    historiqueLabels: [] as string[],
    repartitionData: [] as number[],
    repartitionLabels: [] as string[],
    totalVendeurs: 0,
    totalPromotions: 0,
    totalCommandesPayees: 0,
    revenuTotal: 0,
    vendorLabels: [] as string[],
    vendorPurchaseData: [] as number[],
    vendorRevenueData: [] as number[]
  });

  isCategorieModalOpen = signal<boolean>(false);
  isPromotionModalOpen = signal<boolean>(false);

  derniersLivres: any[] = [];
  derniersUtilisateurs: any[] = [];
  vendorLeaders: Array<{ name: string; purchases: number; revenue: number }> = [];
  adminPurchaseAlerts: any[] = [];
  pendingVendorRequests: any[] = [];


  allSpotlightItems = [
    { title: 'Gouvernance des Vendeurs', icon: 'users', shortcut: 'G V', action: 'vendeurs' },
    { title: 'Architecture des Catégories', icon: 'layers', shortcut: 'A C', action: 'categories' },
    { title: 'Centre de Promotions', icon: 'trending-up', shortcut: 'C P', action: 'promotions' }
  ];
  filteredSpotlightItems = signal([...this.allSpotlightItems]);

  ngAfterViewInit() {
    this.isViewReady = true;
    this.startClock();
    this.fetchAdminStats();
    // In case stats already arrived before AfterViewInit
    if (this.stats().repartitionLabels.length > 0) {
      this.initCharts();
    }
  }

  ngOnDestroy() {
    clearInterval(this.timeInterval);
    this.lineChart?.destroy();
    this.doughnutChart?.destroy();
    this.vendorChart?.destroy();
  }

  // --- Clock Logic ---
  startClock() {
    const updateTime = () => {
      const now = new Date();
      this.currentTime.set(now.toLocaleTimeString('fr-FR', { hour12: false }));
    };
    updateTime();
    this.timeInterval = setInterval(updateTime, 1000);
  }

  ngOnInit() {
    // Keep it empty or remove if preferred, but AfterViewInit is used for charts.
  }

  fetchAdminStats() {
    this.adminService.getAdminStats().subscribe({
      next: (data) => {
        console.log('--- DASHBOARD DATA ---', data);
        this.stats.update(current => ({ ...current, ...data }));
        const labels = data.vendorLabels || [];
        const purchases = data.vendorPurchaseData || [];
        const revenue = data.vendorRevenueData || [];
        this.vendorLeaders = labels.slice(0, 4).map((name: string, index: number) => ({
          name,
          purchases: Number(purchases[index] || 0),
          revenue: Number(revenue[index] || 0)
        }));
        this.adminPurchaseAlerts = data.vendorPurchaseAlerts || [];
        if (this.isViewReady) {
          this.initCharts();
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques globales:', err);
        this.initCharts();
      }
    });

    // Load Real Users
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.derniersUtilisateurs = users.sort((a: any, b: any) => b.id - a.id).slice(0, 4).map((u: any) => {
          const roles = u.roles?.map((r: any) => r.name) || [];
          let label = 'CLIENT';
          let badgeClass = 'bg-white/5 border-white/10 text-zinc-400';
          let roleClass = 'bg-grey-gradient';

          if (roles.includes('ROLE_ADMIN')) {
            label = 'ADMIN';
            badgeClass = 'bg-red-500/10 border-red-500/30 text-red-400';
            roleClass = 'bg-red-gradient';
          } else if (roles.includes('ROLE_VENDEUR')) {
            label = 'VENDEUR';
            badgeClass = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
            roleClass = 'bg-amber-gradient';
          }

          return {
            ...u,
            initials: u.userName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??',
            roleLabel: label,
            badgeClass: badgeClass,
            roleClass: roleClass
          };
        });
      }
    });

    this.loadPendingVendorRequests();

    // Load Real Products
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.derniersLivres = products.sort((a, b) => b.id - a.id).slice(0, 3).map(p => ({
          id: p.id,
          titre: p.nom,
          spec: `SKU-${p.id * 1024}`,
          categorie: p.categorie?.nom || 'Général',
          prix: p.prix
        }));
      }
    });
  }

  getObjectifPercentage(): number {
    return Math.min(100, (this.stats().revenuMensuel / this.stats().objectifMensuel) * 100);
  }

  toggleStore() {
    this.isStoreOpen.set(!this.isStoreOpen());
  }

  toggleAdminAlerts() {
    this.isAdminAlertOpen.set(!this.isAdminAlertOpen());
    if (this.isAdminAlertOpen()) {
      this.loadPendingVendorRequests();
    }
  }

  closeAdminAlerts() {
    this.isAdminAlertOpen.set(false);
  }

  formatAlertTime(value: string | Date | null | undefined): string {
    if (!value) return 'LIVE';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'LIVE';
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  adminAlertCount(): number {
    return this.pendingVendorRequests.length + this.adminPurchaseAlerts.length;
  }

  loadPendingVendorRequests() {
    this.adminService.getPendingUsers().subscribe({
      next: (users) => this.pendingVendorRequests = users || [],
      error: (err) => console.error('Erreur lors du chargement des vendeurs en attente:', err)
    });
  }

  approvePendingVendor(userId: number) {
    this.adminService.approveUser(userId).subscribe({
      next: () => {
        this.pendingVendorRequests = this.pendingVendorRequests.filter(vendor => vendor.id !== userId);
        this.fetchAdminStats();
      },
      error: (err) => console.error('Erreur lors de l\'approbation vendeur:', err)
    });
  }

  rejectPendingVendor(userId: number) {
    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        this.pendingVendorRequests = this.pendingVendorRequests.filter(vendor => vendor.id !== userId);
        this.fetchAdminStats();
      },
      error: (err) => console.error('Erreur lors du rejet vendeur:', err)
    });
  }

  getInitials(name: string | null | undefined): string {
    const parts = (name || 'Vendeur')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    return parts.map(part => part[0]?.toUpperCase() || '').join('') || 'V';
  }

  // --- Spotlight Logic (Cmd+K) ---
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.toggleSpotlight();
    }
    if (event.key === 'Escape') {
      this.closeSpotlight();
      this.closeAdminAlerts();
      this.closePromoModal();
      this.closeCategorieModal();
      this.closePromotionModal();
    }
  }

  toggleSpotlight() {
    this.isSpotlightOpen.set(!this.isSpotlightOpen());
    if (this.isSpotlightOpen()) {
      setTimeout(() => this.searchInput.nativeElement.focus(), 100);
    }
  }

  closeSpotlight() {
    this.isSpotlightOpen.set(false);
  }

  filterSpotlight(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredSpotlightItems.set(
      this.allSpotlightItems.filter(item => item.title.toLowerCase().includes(term))
    );
  }

  handleSpotlightAction(action: string) {
    this.closeSpotlight();
    if (action === 'vendeurs') {
      this.router.navigate(['/admin/vendeurs']);
    } else if (action === 'categories') {
      this.router.navigate(['/admin/categories']);
    } else if (action === 'promotions') {
      this.router.navigate(['/admin/promotions']);
    }
  }

  closeCategorieModal() {
    this.isCategorieModalOpen.set(false);
  }

  creerCategorie(nom: string) {
    if (!nom.trim()) return;
    this.adminService.creerCategorie(nom).subscribe({
      next: (res) => {
        console.log('Catégorie créée:', res);
        this.closeCategorieModal();
      },
      error: (err) => console.error('Erreur de création de catégorie:', err)
    });
  }

  closePromotionModal() {
    this.isPromotionModalOpen.set(false);
  }

  lancerPromotion(pourcentage: string, dateFin: string) {
    if (!pourcentage || !dateFin) return;
    this.adminService.lancerPromotionGlobale(Number(pourcentage), dateFin).subscribe({
      next: (res) => {
        console.log('Promotion globale lancée:', res);
        this.closePromotionModal();
      },
      error: (err) => console.error('Erreur lancement promotion:', err)
    });
  }

  // --- Promo Modal Logic ---
  openPromoModal(user: any) {
    this.selectedUserForPromo.set(user);
  }

  closePromoModal() {
    this.selectedUserForPromo.set(null);
  }

  confirmPromo() {
    const user = this.selectedUserForPromo();
    if (user && user.id) {
      this.adminService.approuverVendeur(user.id).subscribe({
        next: (res: any) => {
          console.log('Utilisateur approuvé comme vendeur:', res);
          // Mettre à jour l'état UI
          const index = this.derniersUtilisateurs.findIndex(u => u.id === user.id);
          if (index !== -1) {
            this.derniersUtilisateurs[index].isAdmin = true;
          }
          this.closePromoModal();
        },
        error: (err: any) => {
          console.error('Erreur lors de l\'élévation de privilèges:', err);
          this.closePromoModal();
        }
      });
    } else {
      this.closePromoModal();
    }
  }

  // --- Chart.js Initialization ---
  initCharts() {
    if (!this.lineChartRef || !this.doughnutChartRef || !this.vendorChartRef) return;

    Chart.defaults.color = '#a1a1aa';
    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';

    if (this.lineChart) this.lineChart.destroy();
    if (this.doughnutChart) this.doughnutChart.destroy();
    if (this.vendorChart) this.vendorChart.destroy();

    const stats = this.stats();

    this.lineChart = new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: stats.historiqueLabels,
        datasets: [{
          label: 'Revenu payé (MAD)',
          data: stats.historiquePrixMoyen,
          borderColor: '#d4af37',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#d4af37',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { dash: [4, 4] } }
        }
      }
    });

    this.doughnutChart = new Chart(this.doughnutChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: stats.repartitionLabels,
        datasets: [{
          data: stats.repartitionData,
          backgroundColor: ['#d4af37', '#bf5af2', '#0a84ff', '#34c759', '#ff9500', '#ff2d55'],
          borderWidth: 0,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { boxWidth: 12, usePointStyle: true, padding: 20, color: '#fff' }
          }
        }
      }
    });

    this.vendorChart = new Chart(this.vendorChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: stats.vendorLabels,
        datasets: [{
          label: 'Achats',
          data: stats.vendorPurchaseData,
          backgroundColor: 'rgba(212, 175, 55, 0.72)',
          borderColor: '#d4af37',
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 22
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#a1a1aa', font: { size: 9, weight: 'bold' } } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#71717a', precision: 0 } }
        }
      }
    });
  }
}
