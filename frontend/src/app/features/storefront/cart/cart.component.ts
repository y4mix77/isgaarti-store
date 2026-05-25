import { AfterViewChecked, Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { ProductService, Produit } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { forkJoin } from 'rxjs';

interface ShippingAddress {
   id: number;
   fullName: string;
   email: string;
   city: string;
   country: string;
   phone: string;
   address: string;
   defaultAddress: boolean;
}

interface PaidOrderLine {
   name: string;
   quantity: number;
   unitPrice: number;
   image?: string;
}

interface PaidOrder {
   orderNumber: string;
   status: string;
   paymentStatus: string;
   total: number;
   subtotal: number;
   shippingCost: number;
   taxAmount: number;
   promoDiscount: number;
   promoCode?: string;
   clientName: string;
   clientEmail: string;
   shippingPhone: string;
   shippingAddress: string;
   shippingCity: string;
   shippingCountry: string;
   items: PaidOrderLine[];
}

@Component({
   selector: 'app-cart',
   standalone: true,
   imports: [CommonModule, RouterLink, LucideAngularModule, FormsModule, ReactiveFormsModule],
   template: `
    <div class="acquisition-hub">
      <div class="bg-grid"></div>
      <div class="glow-layer"></div>
      <div class="scan-line"></div>

      <div class="relative z-10 w-full max-w-[1560px] mx-auto px-8 pt-20">
        
        <!-- FLAGSHIP HERO SECTION -->
        <header class="hero-terminal mb-20 relative">
          <div class="flex items-center justify-between">
            <div class="hero-content relative z-10">
               <div class="system-tag flex items-center gap-3 mb-4">
                  <div class="status-orb"></div>
                  <span class="text-amber-500 font-black tracking-[0.8em] text-[10px] uppercase">IsgaArti Secure Console v4.2</span>
               </div>
               <h1 class="hero-title text-white text-[120px] font-black tracking-tighter leading-[0.8]">
                  Votre <br/> <span class="text-amber-500 glitch-text" data-text="Panier">Panier</span>
               </h1>
            </div>

            <!-- UNIQUE PROGRESS GAUGE -->
            <div class="hero-gauge-hub hidden xl:flex items-center justify-center relative w-64 h-64">
               <svg class="w-full h-full transform -rotate-90">
                  <circle cx="50%" cy="50%" r="48%" stroke="rgba(255,255,255,0.03)" stroke-width="2" fill="transparent" />
                  <circle cx="50%" cy="50%" r="48%" stroke="#fbbf24" stroke-width="2" fill="transparent" 
                          stroke-dasharray="301.59" [attr.stroke-dashoffset]="301.59 * (1 - currentStep() / 4)"
                          class="transition-all duration-1000 ease-out" />
               </svg>
               <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span class="text-amber-500 font-mono text-4xl font-black">{{ (currentStep() / 4 * 100) | number:'1.0-0' }}%</span>
                  <span class="text-[8px] font-black text-white opacity-30 tracking-[0.3em] mt-1 uppercase">PROGRESS STATUS</span>
               </div>
               <div class="gauge-reticle"></div>
            </div>
          </div>
        </header>

        <!-- PROGRESS PROTOCOL -->
        <div class="stepper-hub-premium mb-16 border-y border-white/5 py-8">
           <div class="flex justify-between items-center px-16 relative z-10">
              @for (step of steps; track step.id) {
                 <div class="protocol-node flex items-center gap-6" [class.active]="currentStep() === step.id" [class.completed]="currentStep() > step.id">
                    <div class="badge w-12 h-12 rounded-lg border border-white/10 flex items-center justify-center transition-all duration-500" [class.bg-amber-500]="currentStep() >= step.id" [class.text-black]="currentStep() >= step.id" [class.shadow-[0_0_20px_rgba(251,191,36,0.3)]]="currentStep() >= step.id">
                       <lucide-icon [name]="step.icon" class="w-5 h-5"></lucide-icon>
                    </div>
                    <div class="meta">
                       <span class="id text-[8px] font-black opacity-20 block uppercase mb-1">PHASE 0{{ step.id }}</span>
                       <span class="name text-white font-black text-[10px] tracking-[0.2em] uppercase">{{ step.label }}</span>
                    </div>
                 </div>
                 @if (!step.isLast) { <div class="bridge flex-1 h-[1px] bg-white/5 mx-12"></div> }
              }
           </div>
        </div>

        <div class="workspace-layout grid grid-cols-[1fr_430px] gap-12 items-start" [class.confirmation-layout]="currentStep() === 4">
           
           <!-- PRIMARY WORKBOX -->
           <div class="primary-section space-y-12">
              
              <!-- STEP 1: PANIER -->
              @if (currentStep() === 1) {
                 <div class="manifest-module animate-in fade-in slide-up duration-500">
                    <div class="module-hdr-flagship mb-10">
                       <div class="hdr-accent"></div>
                       <lucide-icon name="list" class="w-4 h-4 text-amber-500"></lucide-icon>
                       <span>RÉCAPITULATIF DE VOTRE COMMANDE</span>
                    </div>

                    @if (cartItems().length === 0) {
                       <div class="empty-manifest-terminal relative py-24 px-12 bg-[#111113]/40 backdrop-blur-3xl border border-white/5 rounded-3xl overflow-hidden shadow-xl flex flex-col items-center justify-center text-center">
                          <div class="relative z-10 flex flex-col items-center">
                             <div class="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8">
                                <lucide-icon name="package" class="w-6 h-6 text-white opacity-20"></lucide-icon>
                             </div>
                             <a routerLink="/produits" class="shadcn-btn-discovery px-8 h-10 bg-white hover:bg-zinc-200 text-black text-[11px] font-black uppercase tracking-widest rounded-md transition-all duration-300 flex items-center justify-center shadow-lg">
                                Découvrir nos produits
                             </a>
                          </div>
                       </div>
                    } @else {
                       <div class="manifest-grid space-y-5">
                          @for (item of cartItems(); track item.id) {
                             <div class="cart-swipe-shell" [class.delete-open]="swipedItemId() === item.id" [class.swiping]="isSwipeRevealing(item.id)">
                                <button (click)="deleteSwipedItem(item.id, $event)" class="swipe-delete-action">
                                   <span class="delete-scan"></span>
                                   <lucide-icon name="trash-2" class="w-5 h-5"></lucide-icon>
                                   <span>Supprimer</span>
                                </button>

                                <div class="asset-node-flagship cart-product-node group relative"
                                     [style.transform]="cardSwipeTransform(item.id)"
                                     (pointerdown)="startSwipe(item.id, $event)"
                                     (pointermove)="moveSwipe(item.id, $event)"
                                     (pointerup)="endSwipe(item.id)"
                                     (pointercancel)="endSwipe(item.id)"
                                     (pointerleave)="endSwipe(item.id)">
                                   <div class="cart-card-accent"></div>
                                   <div class="node-hdr cart-product-header">
                                      <div class="flex items-center gap-3 min-w-0">
                                         <div class="cart-cert-dot"></div>
                                         <span>Article certifié</span>
                                      </div>
                                      <em>SKU-{{ item.id }}</em>
                                   </div>
                                   <div class="node-body cart-product-body">
                                      <div class="node-asset-platform cart-product-media">
                                         <img [src]="item.image" [alt]="item.nom">
                                         <div class="media-grid-lines"></div>
                                         <div class="platform-base"></div>
                                         <div class="viz-reticle-box">
                                            <div class="reticle-corner top-left"></div>
                                            <div class="reticle-corner top-right"></div>
                                            <div class="reticle-corner bottom-left"></div>
                                            <div class="reticle-corner bottom-right"></div>
                                         </div>
                                      </div>
                                   
                                      <div class="node-content cart-product-content">
                                         <span class="cart-product-kicker">{{ item.categorie?.nom || 'Produit vérifié' }}</span>
                                         <h4>{{ item.nom }}</h4>
                                         <div class="cart-product-meta">
                                            <div><span>Vendeur</span><strong>{{ item.vendeur?.nom || 'ISGAARTI' }}</strong></div>
                                            <div><span>Stock</span><strong>{{ item.stock > 0 ? 'Disponible' : 'Limité' }}</strong></div>
                                         </div>
                                      </div>

                                      <div class="node-actions cart-product-actions">
                                         <div class="price-display">
                                            <span>Total</span>
                                            <strong>{{ (item.prix * item.quantity) | number:'1.0-0' }} <em>MAD</em></strong>
                                         </div>
                                         <div class="qty-control">
                                            <button (click)="updateQuantity(item.id, item.quantity - 1)">-</button>
                                            <span>{{ item.quantity }}</span>
                                            <button (click)="updateQuantity(item.id, item.quantity + 1)">+</button>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          }
                       </div>
                    }
                 </div>
              }

              <!-- STEP 2: LIVRAISON -->
              @if (currentStep() === 2) {
                 <div class="shipping-module animate-in fade-in slide-in-from-right-8 duration-700">
                    <div class="logistics-command-header mb-12">
                       <div class="logistics-title-block">
                          <div class="logistics-icon-core">
                             <lucide-icon name="route" class="w-5 h-5"></lucide-icon>
                          </div>
                          <div>
                             <span class="logistics-kicker">PHASE 02 // LOGISTIQUE</span>
                             <h2>Delivery Network</h2>
                          </div>
                       </div>
                       <div class="delivery-eta logistics-eta">
                          <lucide-icon name="timer-reset" class="w-4 h-4"></lucide-icon>
                          <div>
                             <span>Arrivée estimée</span>
                             <strong>24-48 HEURES</strong>
                          </div>
                       </div>
                    </div>

                    <div class="shipping-main-grid grid grid-cols-1 gap-12 items-start mt-12">
                       <div class="module-body shipping-form-panel p-10 bg-[#111113]/80 backdrop-blur-3xl border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative group">
                          <div class="viz-map-overlay absolute inset-0 opacity-[0.03] pointer-events-none">
                             <div class="grid-lines"></div>
                          </div>
                          
                          <div class="shipping-panel-head relative z-10">
                             <div>
                                <span>Adresse mondiale</span>
                                <strong>Coordonnées de livraison</strong>
                             </div>
                             <div class="shipping-security-chip">
                                <lucide-icon name="fingerprint" class="w-4 h-4"></lucide-icon>
                                <span>Vérifié</span>
                             </div>
                          </div>

                          <div class="address-mode-console relative z-10">
                             <button type="button" class="address-mode-btn" [class.active]="shippingAddressMode() === 'saved'" (click)="setShippingAddressMode('saved')" [disabled]="savedShippingAddresses().length === 0">
                                <lucide-icon name="database" class="w-4 h-4"></lucide-icon>
                                <span>Adresses enregistrées</span>
                                <strong>{{ savedShippingAddresses().length }}</strong>
                             </button>
                             <button type="button" class="address-mode-btn" [class.active]="shippingAddressMode() === 'new'" (click)="setShippingAddressMode('new')">
                                <lucide-icon name="map-pin" class="w-4 h-4"></lucide-icon>
                                <span>Nouvelle adresse</span>
                                <strong>ADD</strong>
                             </button>
                          </div>

                          @if (shippingAddressMode() === 'saved' && savedShippingAddresses().length > 0) {
                             <div class="saved-address-grid relative z-10">
                                @for (address of savedShippingAddresses(); track address.id) {
                                   <button type="button" class="saved-address-card" [class.selected]="selectedShippingAddressId() === address.id" (click)="selectShippingAddress(address)">
                                      <div class="saved-address-top">
                                         <span>{{ address.defaultAddress ? 'Adresse principale' : 'Adresse client' }}</span>
                                         <lucide-icon name="check-circle" class="w-4 h-4"></lucide-icon>
                                      </div>
                                      <strong>{{ address.fullName }}</strong>
                                      <p>{{ address.address }}</p>
                                      <div>
                                         <em>{{ address.city }}, {{ address.country }}</em>
                                         <em>{{ address.phone }}</em>
                                      </div>
                                   </button>
                                }
                             </div>
                          }

                          <form [formGroup]="infoForm" class="shipping-form-grid relative z-10">
                             <div class="input-node-flagship group" [class.valid]="infoForm.get('fullName')?.valid">
                                <div class="flex justify-between items-center mb-3">
                                   <label class="text-[9px] font-black text-white opacity-20 tracking-[0.3em] uppercase group-focus-within:text-amber-500 transition-all">Identité du Destinataire</label>
                                   <div *ngIf="infoForm.get('fullName')?.valid" class="text-green-500 animate-in fade-in zoom-in"><lucide-icon name="shield-check" class="w-3 h-3"></lucide-icon></div>
                                </div>
                                <div class="input-shell-flagship bg-black/60 border border-white/10 rounded-2xl flex items-center focus-within:border-amber-500 focus-within:shadow-[0_0_30px_rgba(251,191,36,0.15)] transition-all overflow-hidden">
                                   <div class="px-7 opacity-20 group-focus-within:opacity-100 transition-opacity"><lucide-icon name="user" class="w-5 h-5"></lucide-icon></div>
                                   <input type="text" formControlName="fullName" placeholder="Entrez le nom complet" class="flex-1 bg-transparent py-6 text-white font-black text-sm outline-none placeholder:text-white/10 placeholder:text-[10px] placeholder:tracking-[0.2em] tracking-wider">
                                </div>
                             </div>
                             <div class="grid grid-cols-2 gap-8 logistics-two-col">
                                <div class="input-node-flagship group" [class.valid]="infoForm.get('email')?.valid">
                                   <label class="text-[9px] font-black text-white opacity-20 tracking-[0.3em] uppercase mb-3 block group-focus-within:text-amber-500 transition-all">Adresse Mail</label>
                                   <div class="input-shell-flagship bg-black/60 border border-white/10 rounded-2xl flex items-center focus-within:border-amber-500 transition-all overflow-hidden">
                                      <div class="px-7 opacity-20 group-focus-within:opacity-100"><lucide-icon name="mail" class="w-5 h-5"></lucide-icon></div>
                                      <input type="email" formControlName="email" placeholder="Mail de contact" class="flex-1 bg-transparent py-6 text-white font-black text-sm outline-none placeholder:text-white/10 placeholder:text-[10px] placeholder:tracking-[0.2em]">
                                   </div>
                                </div>
                                <div class="input-node-flagship group" [class.valid]="infoForm.get('city')?.valid">
                                   <label class="text-[9px] font-black text-white opacity-20 tracking-[0.3em] uppercase mb-3 block group-focus-within:text-amber-500 transition-all">Ville</label>
                                   <div class="input-shell-flagship bg-black/60 border border-white/10 rounded-2xl flex items-center focus-within:border-amber-500 transition-all overflow-hidden">
                                      <div class="px-7 opacity-20 group-focus-within:opacity-100"><lucide-icon name="building" class="w-5 h-5"></lucide-icon></div>
                                      <input type="text" formControlName="city" placeholder="Ville de destination" class="flex-1 bg-transparent py-6 text-white font-black text-sm outline-none placeholder:text-white/10 placeholder:text-[10px] placeholder:tracking-[0.2em]">
                                   </div>
                                </div>
                             </div>
                             <div class="grid grid-cols-[1.1fr_0.9fr] gap-8 logistics-two-col">
                                <div class="input-node-flagship group" [class.valid]="infoForm.get('country')?.valid">
                                   <label class="text-[9px] font-black text-white opacity-20 tracking-[0.3em] uppercase mb-3 block group-focus-within:text-amber-500 transition-all">Pays</label>
                                   <div class="input-shell-flagship country-select-shell bg-black/60 border border-white/10 rounded-2xl flex items-center focus-within:border-amber-500 transition-all overflow-hidden">
                                      <div class="px-7 opacity-20 group-focus-within:opacity-100"><lucide-icon name="map-pin" class="w-5 h-5"></lucide-icon></div>
                                      <select formControlName="country" (change)="onCountryChanged()" class="flex-1 bg-transparent py-6 text-white font-black text-sm outline-none tracking-wider">
                                         <option value="" disabled>Choisir le pays</option>
                                         @for (country of countries; track country.code) {
                                            <option [value]="country.name">{{ country.name }} · {{ country.dial }}</option>
                                         }
                                      </select>
                                      <div class="select-chevron"><lucide-icon name="chevron-down" class="w-4 h-4"></lucide-icon></div>
                                   </div>
                                </div>
                                <div class="input-node-flagship group" [class.valid]="infoForm.get('phone')?.valid">
                                   <label class="text-[9px] font-black text-white opacity-20 tracking-[0.3em] uppercase mb-3 block group-focus-within:text-amber-500 transition-all">Numéro</label>
                                   <div class="input-shell-flagship bg-black/60 border border-white/10 rounded-2xl flex items-center focus-within:border-amber-500 transition-all overflow-hidden">
                                      <div class="px-7 opacity-20 group-focus-within:opacity-100"><lucide-icon name="phone" class="w-5 h-5"></lucide-icon></div>
                                      <span class="phone-dial-chip">{{ selectedDialCode() }}</span>
                                      <input type="tel" formControlName="phone" [placeholder]="selectedDialCode() + ' 600 000 000'" class="flex-1 bg-transparent py-6 text-white font-black text-sm outline-none placeholder:text-white/10 placeholder:text-[10px] placeholder:tracking-[0.2em] tracking-wider">
                                   </div>
                                </div>
                             </div>
                             <div class="input-node-flagship group" [class.valid]="infoForm.get('address')?.valid">
                                <label class="text-[9px] font-black text-white opacity-20 tracking-[0.3em] uppercase mb-3 block group-focus-within:text-amber-500 transition-all">Adresse de Livraison</label>
                                <div class="input-shell-flagship bg-black/60 border border-white/10 rounded-2xl flex items-start focus-within:border-amber-500 transition-all overflow-hidden">
                                   <div class="px-7 pt-7 opacity-20 group-focus-within:opacity-100"><lucide-icon name="map-pin" class="w-5 h-5"></lucide-icon></div>
                                   <textarea formControlName="address" rows="5" placeholder="Numéro, Rue, Quartier..." class="flex-1 bg-transparent py-7 text-white font-black text-sm outline-none placeholder:text-white/10 placeholder:text-[10px] placeholder:tracking-[0.2em] resize-none leading-relaxed"></textarea>
                                </div>
                             </div>
                             <div class="shipping-save-row">
                                <div>
                                   <span>{{ shippingAddressFeedback() || 'Les adresses sauvegardées seront disponibles à chaque achat.' }}</span>
                                </div>
                                <button type="button" (click)="saveShippingAddress()" [disabled]="infoForm.invalid || isSavingShippingAddress()" class="save-address-btn">
                                   @if (isSavingShippingAddress()) {
                                      <lucide-icon name="refresh-cw" class="w-4 h-4 animate-spin"></lucide-icon>
                                   } @else {
                                      <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
                                   }
                                   <span>Enregistrer</span>
                                </button>
                             </div>
                          </form>
                       </div>
                    </div>
                 </div>
              }

              <!-- STEP 3: PAIEMENT (ELITE HORIZONTAL VAULT) -->
              @if (currentStep() === 3) {
                 <div class="payment-module animate-in fade-in slide-in-from-right-8 duration-700" [class.payment-authorizing]="isProcessing()">
                    
                    <div class="payment-command-header mb-12">
                       <div class="payment-title-block">
                          <div class="payment-icon-core">
                             <lucide-icon name="shield-check" class="w-5 h-5"></lucide-icon>
                          </div>
                          <div>
                             <span>PHASE 03 // AUTORISATION</span>
                             <h2>Payment Authorization</h2>
                          </div>
                       </div>
                       <div class="payment-trust-strip">
                          <div><span>Encryption</span><strong>AES-256</strong></div>
                          <div><span>Route</span><strong>3DS Ready</strong></div>
                          <div><span>Risk</span><strong>Live Check</strong></div>
                       </div>
                    </div>

                    <div class="payment-vault-horizontal payment-vault-stage flex flex-row items-stretch gap-12 mt-12">
                       @if (!embeddedCheckoutActive()) {
                       
                       <!-- FIXED FLAGSHIP CARD (NO HOVER TILT) -->
                       <div class="card-visual-platform-horizontal payment-card-platform relative flex-1 flex items-center justify-center perspective-[3000px]">
                          <div class="vault-orbit-ring"></div>
                          <div class="payment-rail-column left">
                             <span></span><span></span><span></span>
                          </div>
                          <div class="terminal-card-horizontal relative w-[660px] h-[380px] transition-all duration-1000 ease-out preserve-3d"
                               [class.is-flipped]="isFlipped()"
                               [class.brand-visa]="cardBrand() === 'visa'"
                               [class.brand-mastercard]="cardBrand() === 'mastercard'"
                               [class.brand-amex]="cardBrand() === 'amex'"
                               [class.brand-generic]="cardBrand() === 'generic'">
                             <!-- FRONT -->
                             <div class="side front absolute inset-0 backface-hidden bg-[#111113] border border-white/20 rounded-[44px] p-12 flex flex-col justify-between shadow-[0_80px_160px_rgba(0,0,0,0.9)] group overflow-hidden">
                                <div class="glass-glare absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity"></div>
                                <div class="flex justify-between items-start relative z-10">
                                   <div class="chip-flagship w-24 h-16 bg-amber-500/20 border border-amber-500/40 rounded-xl relative overflow-hidden">
                                      <div class="chip-texture absolute inset-0"></div>
                                   </div>
                                   <div class="card-brand-chip">
                                      <span>{{ cardBrandLabel() }}</span>
                                      <strong>{{ cardBrandCode() }}</strong>
                                   </div>
                                </div>
                                <div class="relative z-10 mt-auto">
                                   <div class="card-number-clean text-white font-mono text-[42px] tracking-[0.2em] mb-12 whitespace-nowrap leading-none text-center">{{ cardForm.get('cardNumber')?.value || '•••• •••• •••• ••••' }}</div>
                                   <div class="flex justify-between items-end">
                                      <div class="meta-field">
                                         <span class="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] block mb-2">TITULAIRE_AUTH</span>
                                         <span class="text-white text-base font-black tracking-widest">{{ infoForm.get('fullName')?.value || 'Client Nexus' }}</span>
                                      </div>
                                      <div class="meta-field text-right">
                                         <span class="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] block mb-2">VALID_THRU</span>
                                         <span class="text-white text-base font-black font-mono">{{ cardForm.get('expiry')?.value || 'MM/YY' }}</span>
                                      </div>
                                   </div>
                                </div>
                             </div>
                             <!-- BACK -->
                             <div class="side back absolute inset-0 backface-hidden bg-[#08080a] border border-white/20 rounded-[44px] flex flex-col rotate-y-180 shadow-2xl overflow-hidden">
                                <div class="w-full h-24 bg-black mt-20"></div>
                                <div class="px-20 mt-20 flex items-center justify-between">
                                   <div class="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">SECURITY_HASH</div>
                                   <div class="bg-white h-20 w-44 flex items-center justify-center rounded-2xl shadow-inner">
                                      <span class="text-black font-mono font-black text-4xl tracking-[0.4em]">{{ cardForm.get('cvc')?.value ? '•••' : '' }}</span>
                                   </div>
                                </div>
                                <div class="p-16 mt-auto border-t border-white/5 bg-black/40 text-[10px] font-black text-white/10 uppercase tracking-[0.5em] text-center italic">
                                   ENCRYPTED VAULT ACCESS // NEXUS SECURE
                                </div>
                             </div>
                          </div>
                          <div class="payment-rail-column right">
                             <span></span><span></span><span></span>
                          </div>
                       </div>

                       <!-- COMPACT FLAGSHIP FORM -->
                       <div class="form-container-compact-side payment-auth-panel w-[460px] p-10 bg-[#111113]/80 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden flex-shrink-0">
                          <div class="auth-panel-head relative z-10">
                             <div>
                                <span>Secure checkout</span>
                                <strong>Validation carte</strong>
                             </div>
                             <div class="auth-live-chip">
                                <div></div>
                                <span>Live</span>
                             </div>
                          </div>

                          <div class="payment-form-grid relative z-10">
                             <div class="input-node-flagship group">
                                <div class="flex justify-between items-center mb-3">
                                   <label class="text-[9px] font-black text-white opacity-20 tracking-[0.3em] uppercase group-focus-within:text-amber-500 transition-all">Carte bancaire Stripe</label>
                                   <div *ngIf="stripeCardReady()" class="text-green-500 animate-in fade-in zoom-in"><lucide-icon name="check-circle" class="w-3 h-3"></lucide-icon></div>
                                </div>
                                <div class="stripe-card-element-shell">
                                   <div class="px-6 opacity-30"><lucide-icon name="credit-card" class="w-5 h-5"></lucide-icon></div>
                                   <div id="stripe-card-element" class="stripe-card-element"></div>
                                </div>
                                @if (stripeCardError()) {
                                   <div class="stripe-card-error">{{ stripeCardError() }}</div>
                                }
                             </div>

                             <div class="authorization-stack">
                                <div class="auth-layer active">
                                   <lucide-icon name="fingerprint" class="w-4 h-4"></lucide-icon>
                                   <div><span>Identité</span><strong>{{ infoForm.get('fullName')?.value || 'Client vérifié' }}</strong></div>
                                   <em>OK</em>
                                </div>
                                <div class="auth-layer" [class.active]="stripeCardReady()">
                                   <lucide-icon name="credit-card" class="w-4 h-4"></lucide-icon>
                                   <div><span>Carte</span><strong>{{ stripeCardReady() ? cardBrandLabel() + ' prête' : 'En attente' }}</strong></div>
                                   <em>{{ stripeCardReady() ? 'OK' : 'WAIT' }}</em>
                                </div>
                                <div class="auth-layer" [class.active]="stripeCardReady()">
                                   <lucide-icon name="lock" class="w-4 h-4"></lucide-icon>
                                   <div><span>Autorisation</span><strong>{{ stripeCardReady() ? 'Prête à traiter' : 'Contrôle incomplet' }}</strong></div>
                                   <em>{{ stripeCardReady() ? 'ARMED' : 'SYNC' }}</em>
                                </div>
                             </div>
                          </div>
                       </div>

                       @if (isProcessing()) {
                          <div class="isgaarti-payment-loader">
                             <div class="loader-grid"></div>
                             <div class="loader-word" data-word="ISGAARTI">ISGAARTI</div>
                             <div class="loader-status">
                                <span>{{ paymentAuthorizationText() }}</span>
                                <strong>{{ cardBrandLabel() }} // {{ totalFinalPrice() | number:'1.0-0' }} MAD</strong>
                             </div>
                             <div class="loader-progress">
                                <div></div>
                             </div>
                          </div>
                       }
                       } @else {
                          <div class="stripe-embedded-checkout-shell">
                             <div class="stripe-embedded-head">
                                <div>
                                   <span>Stripe Checkout intégré</span>
                                   <strong>Paiement sécurisé ISGAARTI</strong>
                                </div>
                                <div class="stripe-embedded-badge">
                                   <lucide-icon name="shield-check" class="w-4 h-4"></lucide-icon>
                                   <span>LIVE STRIPE</span>
                                </div>
                             </div>
                             <div id="stripe-embedded-checkout" class="stripe-embedded-mount"></div>
                          </div>
                       }
                    </div>
                 </div>
              }

              <!-- STEP 4: CONFIRMÉ -->
              @if (currentStep() === 4) {
                 <div class="success-module confirmation-command-center animate-zoom-in">
                    <div class="confirmation-scanline"></div>
                    <div class="confirmation-hero-grid">
                       <div class="confirmation-copy">
                          <div class="confirmation-kicker">
                             <span></span>
                             <strong>ORDER AUTHORIZED</strong>
                          </div>
                          <div class="confirmation-hero-title">
                             <span>ISGAARTI STORE</span>
                             <h2>Commande confirmée</h2>
                          </div>
                          <p>Votre paiement est scellé. La commande passe maintenant dans le réseau de préparation et de livraison.</p>
                       </div>

                       <div class="confirmation-seal">
                          <div class="seal-orbit"></div>
                          <div class="seal-core-confirmed">
                             <lucide-icon name="check-circle" class="w-12 h-12"></lucide-icon>
                          </div>
                          <span>Validée</span>
                       </div>
                    </div>

                    <div class="confirmation-dashboard">
                       <div class="receipt-capsule confirmation-ticket">
                          <div class="receipt-head">
                             <div>
                                <span>Référence commande</span>
                                <strong>{{ orderId }}</strong>
                             </div>
                             <lucide-icon name="fingerprint" class="w-6 h-6"></lucide-icon>
                          </div>
                          <div class="receipt-amount">
                             <span>Total autorisé</span>
                             <strong>{{ completedOrderTotal() | number:'1.0-0' }} <em>MAD</em></strong>
                          </div>
                          <div class="ticket-perforation"></div>
                          <div class="receipt-grid">
                             <div><span>Articles</span><strong>{{ completedItemCount() }}</strong></div>
                             <div><span>ETA</span><strong>24-48h</strong></div>
                             <div><span>Canal</span><strong>Secure</strong></div>
                          </div>
                          <div class="ticket-footer-strip">
                             <span>ISGAARTI STORE</span>
                             <div class="ticket-barcode" aria-hidden="true"></div>
                          </div>
                       </div>

                       <div class="fulfillment-line-board">
                          <div class="fulfillment-track">
                             <div class="track-beam"></div>
                             <div class="track-beam-active"></div>
                             <div class="fulfillment-line-step payment done">
                                <div><lucide-icon name="shield-check" class="w-4 h-4"></lucide-icon></div>
                                <span>Paiement vérifié</span>
                                <strong>00: Auth</strong>
                             </div>
                             <div class="fulfillment-line-step prep active">
                                <div><lucide-icon name="package-check" class="w-4 h-4"></lucide-icon></div>
                                <span>Préparation colis</span>
                                <strong>01: Live</strong>
                             </div>
                             <div class="fulfillment-line-step route">
                                <div><lucide-icon name="route" class="w-4 h-4"></lucide-icon></div>
                                <span>Routage expédition</span>
                                <strong>02: Transit</strong>
                             </div>
                             <div class="fulfillment-line-step delivery">
                                <div><lucide-icon name="home" class="w-4 h-4"></lucide-icon></div>
                                <span>Livraison client</span>
                                <strong>03: 24-48h</strong>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div class="confirmation-intel-grid">
                       <div class="intel-node">
                          <lucide-icon name="truck" class="w-5 h-5"></lucide-icon>
                          <span>Expédition</span>
                          <strong>Préparation prioritaire</strong>
                          <p>Le colis entre dans la file logistique et sera routé vers le centre le plus proche.</p>
                       </div>
                       <div class="intel-node">
                          <lucide-icon name="shield-check" class="w-5 h-5"></lucide-icon>
                          <span>Protection</span>
                          <strong>Paiement scellé</strong>
                          <p>L'autorisation est validée et la référence restera liée à votre commande.</p>
                       </div>
                       <div class="intel-node">
                          <lucide-icon name="mail-check" class="w-5 h-5"></lucide-icon>
                          <span>Notification</span>
                          <strong>Suivi client</strong>
                          <p>Les mises à jour d'expédition seront synchronisées avec votre compte client.</p>
                       </div>
                    </div>

                    <div class="confirmation-actions">
                          <button (click)="downloadInvoicePdf()" class="confirmation-btn secondary">
                          <lucide-icon name="file-spreadsheet" class="w-4 h-4"></lucide-icon>
                          <span>Facture</span>
                       </button>
                       <a routerLink="/" class="confirmation-btn primary">
                          <lucide-icon name="home" class="w-4 h-4"></lucide-icon>
                          <span>Accueil</span>
                       </a>
                    </div>
                 </div>
              }
           </div>

           <!-- RIGHT: ACQUISITION HUD -->
           @if (currentStep() < 4) {
              <aside class="acquisition-terminal sticky top-12">
                 <div class="terminal-hud order-state-panel bg-[#111113]/95 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_60px_150px_rgba(0,0,0,1)]">
                    
                    <div class="order-state-header">
                       <div>
                          <span class="order-state-eyebrow">Commande sécurisée</span>
                          <h3>État de la commande</h3>
                       </div>
                       <div class="order-live-badge">
                          <div></div>
                          <span>LIVE</span>
                       </div>
                    </div>

                    <div class="order-phase-card">
                       <div class="phase-orbit">
                          <svg viewBox="0 0 84 84">
                             <circle cx="42" cy="42" r="36"></circle>
                             <circle cx="42" cy="42" r="36" [attr.stroke-dashoffset]="226.19 * (1 - currentStep() / 4)"></circle>
                          </svg>
                          <div>
                             <strong>{{ currentStep() }}</strong>
                             <span>/4</span>
                          </div>
                       </div>
                       <div class="phase-copy">
                          <span>Phase active</span>
                          <strong>{{ activeStepLabel() }}</strong>
                          <p>{{ activeStepDescription() }}</p>
                       </div>
                    </div>

                    <div class="order-progress-rail">
                       @for (s of steps.slice(0, 3); track s.id) {
                          <div class="order-progress-row" [class.done]="currentStep() > s.id" [class.active]="currentStep() === s.id">
                             <div class="progress-node">
                                <lucide-icon [name]="s.icon" class="w-3.5 h-3.5"></lucide-icon>
                             </div>
                             <div class="progress-copy">
                                <span>Phase 0{{ s.id }}</span>
                                <strong>{{ s.label }}</strong>
                             </div>
                             <em>{{ currentStep() > s.id ? 'Validée' : (currentStep() === s.id ? 'En cours' : 'À venir') }}</em>
                          </div>
                       }
                    </div>

                    <div class="free-shipping-console" [class.unlocked]="hasFreeShipping()">
                       <div class="free-shipping-head">
                          <div class="free-shipping-icon">
                             <lucide-icon name="truck" class="w-4 h-4"></lucide-icon>
                          </div>
                          <div>
                             <span>{{ hasFreeShipping() ? 'Livraison offerte activée' : 'Objectif livraison offerte' }}</span>
                             @if (hasFreeShipping()) {
                                <strong>Frais annulés</strong>
                             } @else {
                                <strong>Encore {{ freeShippingRemaining() | number:'1.0-0' }} MAD</strong>
                             }
                          </div>
                       </div>
                       <div class="free-shipping-track" aria-hidden="true">
                          <div [style.width.%]="freeShippingProgress()"></div>
                       </div>
                       <div class="free-shipping-meta">
                          <span>{{ discountedSubtotal() | number:'1.0-0' }} MAD</span>
                          <strong>Seuil 200 MAD</strong>
                       </div>
                       <div class="shipping-price-chip">
                          <span>Frais actuels</span>
                          <strong>{{ hasFreeShipping() ? 'GRATUIT' : '30 MAD' }}</strong>
                       </div>
                    </div>

                    <div class="hud-manifest order-manifest">
                       <div class="order-section-title">
                          <span>Manifest</span>
                          <strong>{{ cartItems().length }} produits</strong>
                       </div>
                       <div class="mini-node-list space-y-3 max-h-[170px] overflow-y-auto pr-2 custom-scrollbar">
                          @for (item of cartItems(); track item.id) {
                             <div class="mini-asset order-mini-asset">
                                <div class="a-img">
                                   <img [src]="item.image" class="w-full h-full object-contain relative z-10">
                                </div>
                                <div class="a-info flex-1 min-w-0">
                                   <span class="a-name">{{ item.nom }}</span>
                                   <span class="a-price">{{ (item.prix * item.quantity) | number:'1.0-0' }} MAD</span>
                                </div>
                                <div class="a-qty">x{{ item.quantity }}</div>
                             </div>
                          }
                       </div>
                    </div>

                    <div class="hud-promo-terminal order-promo-terminal" [class.promo-success]="promoState() === 'success'" [class.promo-error]="promoState() === 'error'" [class.promo-locked]="isPromoLocked()">
                       <div class="promo-orbital">
                          <div class="promo-title-row">
                             <div>
                                <label>CODE PROMOTIONNEL</label>
                                <span>Synchronisé avec les promotions des produits</span>
                             </div>
                             @if (promoState() === 'success') {
                                <strong class="promo-state-pill success">SCELLÉ</strong>
                             } @else if (promoState() === 'error') {
                                <strong class="promo-state-pill error">REFUSÉ</strong>
                             } @else {
                                <strong class="promo-state-pill">READY</strong>
                             }
                          </div>

                          <div class="promo-input-shell flagship-promo-input">
                             <div class="promo-icon"><lucide-icon name="ticket" class="w-4 h-4"></lucide-icon></div>
                             <input type="text" #promoInput placeholder="ENTRER LE CODE PRODUIT" [value]="appliedPromoCode() || ''" [disabled]="isPromoLocked()" (input)="resetPromoFeedback()" (keyup.enter)="applyPromoCode(promoInput.value)">
                             <button (click)="applyPromoCode(promoInput.value)" [disabled]="isPromoLocked()">
                                <span>{{ isPromoLocked() ? 'LOCKED' : 'SYNC' }}</span>
                             </button>
                          </div>

                          @if (promoFeedback()) {
                             <div class="promo-feedback" [class.success]="promoState() === 'success'" [class.error]="promoState() === 'error'">
                                <lucide-icon [name]="promoState() === 'success' ? 'check-circle' : 'alert-circle'" class="w-3.5 h-3.5"></lucide-icon>
                                <span>{{ promoFeedback() }}</span>
                             </div>
                          }

                          @if (appliedPromo()) {
                             <div class="promo-lock-seal">
                                <div class="seal-line"></div>
                                <div class="seal-core">
                                   <div class="seal-icon"><lucide-icon name="lock" class="w-3.5 h-3.5"></lucide-icon></div>
                                   <div>
                                      <strong>Code appliqué avec succès</strong>
                                      <span>{{ appliedPromoCode() }} est verrouillé pour cette commande.</span>
                                   </div>
                                </div>
                             </div>

                             <div class="promo-impact-card">
                                <div>
                                   <span>Remise appliquée</span>
                                   <strong>-{{ appliedPromo() }}%</strong>
                                </div>
                                <div>
                                   <span>Produits matchés</span>
                                   <strong>{{ promoMatchedCount() }}</strong>
                                </div>
                                <div>
                                   <span>Économie</span>
                                   <strong>{{ promoDiscountAmount() | number:'1.0-0' }} MAD</strong>
                                </div>
                             </div>
                          }
                       </div>
                    </div>

                    <!-- PRICING -->
                    <div class="hud-pricing p-6 bg-black/10">
                       <div class="pricing-engine space-y-3">
                          <div class="pricing-row flex justify-between items-center group">
                             <div class="l-hub flex items-center gap-3">
                                <div class="w-1 h-1 bg-white/10 rounded-full group-hover:bg-amber-500 transition-colors"></div>
                                <span class="text-[9px] font-black text-white opacity-20 tracking-[0.3em] uppercase">SOUS-TOTAL</span>
                             </div>
                             <span class="v text-white font-mono font-black text-xs">{{ totalPrice() | number:'1.0-0' }} MAD</span>
                          </div>
                          <div class="pricing-row flex justify-between items-center group">
                             <div class="l-hub flex items-center gap-3">
                                <div class="w-1 h-1 bg-white/10 rounded-full group-hover:bg-amber-500 transition-colors"></div>
                                <span class="text-[9px] font-black text-white opacity-20 tracking-[0.3em] uppercase">FRAIS DE LIVRAISON</span>
                             </div>
                             <span class="v text-white font-mono font-black text-xs">
                                @if (hasFreeShipping()) { GRATUIT } @else { {{ shippingCost() | number:'1.0-0' }} MAD }
                             </span>
                          </div>
                          <div class="pricing-row flex justify-between items-center group">
                             <div class="l-hub flex items-center gap-3">
                                <div class="w-1 h-1 bg-white/10 rounded-full group-hover:bg-amber-500 transition-colors"></div>
                                <span class="text-[9px] font-black text-white opacity-20 tracking-[0.3em] uppercase">TAXES (15%)</span>
                             </div>
                             <span class="v text-white font-mono font-black text-xs">{{ (discountedSubtotal() * 0.15) | number:'1.0-0' }} MAD</span>
                          </div>
                          @if (promoDiscountAmount() > 0) {
                             <div class="pricing-row flex justify-between items-center group promo-row-discount">
                                <div class="l-hub flex items-center gap-3">
                                   <div class="w-1 h-1 bg-green-500 rounded-full"></div>
                                   <span class="text-[9px] font-black text-green-500/70 tracking-[0.3em] uppercase">RÉDUCTION CODE</span>
                                </div>
                                <span class="v text-green-500 font-mono font-black text-xs">-{{ promoDiscountAmount() | number:'1.0-0' }} MAD</span>
                             </div>
                          }
                       </div>

                       <div class="hud-total-terminal mt-8 p-5 bg-black/80 border border-amber-500/20 rounded-xl relative overflow-hidden group shadow-inner">
                          <div class="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-20 transition-opacity"><lucide-icon name="shield-check" class="w-10 h-10 text-amber-500"></lucide-icon></div>
                          <span class="text-[7px] font-black text-amber-500 tracking-[0.5em] uppercase mb-1 block">MONTANT TOTAL</span>
                          <span class="text-white font-mono text-3xl font-black tracking-tighter">{{ totalFinalPrice() | number:'1.0-0' }} <span class="text-xs ml-1 text-amber-500 font-black">MAD</span></span>
                       </div>
                    </div>

                    <!-- ACTIONS -->
                    <div class="hud-actions p-6 pt-0">
                       @if (cartItems().length > 0) {
                          <button (click)="currentStep() === 3 ? processPayment() : nextStep()" 
                                  [disabled]="isStepInvalid() || isProcessing() || embeddedCheckoutActive()" 
                                  class="action-button-flagship w-full h-14 bg-white hover:bg-amber-500 rounded-lg flex items-center justify-between px-8 text-black transition-all duration-500 group disabled:opacity-10">
                             <span class="text-[9px] font-black tracking-[0.2em] uppercase">
                                @if (isProcessing()) { CHARGEMENT STRIPE... }
                                @else { {{ currentStep() === 3 ? 'PAYER MAINTENANT' : 'ÉTAPE SUIVANTE' }} }
                             </span>
                             <lucide-icon name="arrow-right" class="w-4 h-4 group-hover:translate-x-2 transition-transform"></lucide-icon>
                          </button>
                          @if (paymentFeedback()) {
                             <div class="stripe-feedback" [class.error]="paymentFeedbackType() === 'error'" [class.success]="paymentFeedbackType() === 'success'">
                                <lucide-icon [name]="paymentFeedbackType() === 'error' ? 'alert-circle' : 'shield-check'" class="w-3.5 h-3.5"></lucide-icon>
                                <span>{{ paymentFeedback() }}</span>
                             </div>
                          }
                          @if (currentStep() > 1) {
                             <button (click)="prevStep()" class="w-full text-[8px] font-black text-white opacity-20 hover:opacity-100 transition-all uppercase tracking-[0.6em] mt-5">
                                ÉTAPE PRÉCÉDENTE
                             </button>
                          }
                       }
                    </div>

                    <div class="hud-footer-meta bg-black/60 py-3 px-8 border-t border-white/5 flex items-center justify-between">
                       <span class="text-[7px] font-black text-white opacity-10 tracking-[0.4em] uppercase">SYSTEME SÉCURISÉ</span>
                       <span class="text-[7px] font-mono text-white opacity-10 uppercase">v4.2</span>
                    </div>

                 </div>
              </aside>
           }
        </div>

        <footer class="cart-footer">
           <span class="footer-brand">ISGAARTI Store</span>
           <span class="footer-copy">Copyright {{ currentYear }}. All rights reserved.</span>
        </footer>

      </div>
    </div>

    <style>
      .acquisition-hub { min-height: 100vh; background: #070708; color: #fff; font-family: 'Inter', sans-serif; position: relative; overflow-x: hidden; }
      .bg-grid { position: fixed; inset: 0; opacity: 0.04; background-image: linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px); background-size: 100px 100px; mask-image: radial-gradient(circle at center, black, transparent 90%); z-index: 0; }
      .glow-layer { position: fixed; top: -10%; right: -5%; width: 60vw; height: 60vh; background: radial-gradient(circle, rgba(251,191,36,0.04), transparent 70%); z-index: 0; }
      .scan-line { position: fixed; inset: 0; height: 2px; background: linear-gradient(to right, transparent, rgba(251,191,36,0.05), transparent); animation: scan 8s linear infinite; z-index: 1; pointer-events: none; }

      .hero-title { line-height: 0.8; text-shadow: 0 0 50px rgba(255,255,255,0.05); }
      .glitch-text { position: relative; display: inline-block; }
      .glitch-text::before, .glitch-text::after { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.8; }
      .glitch-text::before { color: #fbbf24; animation: glitch 3s infinite; z-index: -1; }

      .status-orb { width: 10px; height: 10px; background: #fbbf24; border-radius: 50%; shadow: 0 0 15px #fbbf24; animation: pulse 2s infinite; }
      .gauge-reticle { position: absolute; inset: -10px; border: 1px dashed rgba(251,191,36,0.1); border-radius: 50%; animation: spin 40s linear infinite; }

      .module-hdr-flagship { position: relative; padding-left: 28px; display: flex; align-items: center; gap: 14px; }
      .module-hdr-flagship .hdr-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #fbbf24; border-radius: 2px; box-shadow: 0 0 15px #fbbf24; }
      .module-hdr-flagship span { font-size: 11px; font-weight: 950; letter-spacing: 0.3em; color: #fff; text-transform: uppercase; }
      .workspace-layout {
        grid-template-columns: minmax(0, 1fr) 430px !important;
        gap: 40px !important;
      }
      .workspace-layout.confirmation-layout {
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 0 !important;
      }
      .primary-section { min-width: 0; }

      .input-node-flagship.valid .input-shell-flagship { border-color: rgba(34, 197, 94, 0.4); }
      .logistics-command-header {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        padding: 18px 20px;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 18px;
        background: linear-gradient(135deg, rgba(255,255,255,0.055), rgba(8,8,10,0.88));
        box-shadow: 0 24px 70px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.06);
        overflow: hidden;
      }
      .logistics-command-header::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          linear-gradient(90deg, rgba(251,191,36,0.14), transparent 34%),
          repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 42px);
        opacity: 0.36;
        pointer-events: none;
      }
      .logistics-title-block {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 16px;
        min-width: 0;
      }
      .logistics-icon-core {
        width: 50px;
        height: 50px;
        display: grid;
        place-items: center;
        color: #fbbf24;
        border: 1px solid rgba(251,191,36,0.28);
        border-radius: 14px;
        background: rgba(251,191,36,0.08);
        box-shadow: 0 0 32px rgba(251,191,36,0.12);
        flex: 0 0 auto;
      }
      .logistics-kicker {
        display: block;
        color: #fbbf24;
        font-size: 9px;
        font-weight: 950;
        letter-spacing: 0.32em;
        text-transform: uppercase;
        margin-bottom: 5px;
      }
      .logistics-title-block h2 {
        color: white;
        font-size: 28px;
        font-weight: 950;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        line-height: 1;
      }
      .logistics-eta {
        position: relative;
        z-index: 1;
        min-width: 188px;
        padding: 10px 13px;
        border-radius: 14px;
        border: 1px solid rgba(251,191,36,0.22);
        background: rgba(251,191,36,0.075);
        color: #fbbf24;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .logistics-eta span {
        display: block;
        color: rgba(255,255,255,0.35);
        font-size: 7px;
        font-weight: 950;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      .logistics-eta strong {
        display: block;
        color: #fbbf24;
        font-size: 10px;
        font-weight: 950;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        margin-top: 2px;
      }
      .shipping-form-panel {
        min-height: 620px;
        border-radius: 18px;
        overflow: hidden;
        background:
          linear-gradient(135deg, rgba(255,255,255,0.055), rgba(17,17,19,0.94)),
          radial-gradient(circle at 10% 0%, rgba(251,191,36,0.08), transparent 38%);
      }
      .shipping-form-panel::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 3px;
        background: linear-gradient(90deg, #fbbf24, transparent 62%);
        box-shadow: 0 0 24px rgba(251,191,36,0.35);
      }
      .shipping-panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        padding-bottom: 26px;
        margin-bottom: 28px;
        border-bottom: 0;
      }
      .shipping-panel-head span {
        display: block;
        color: rgba(255,255,255,0.28);
        font-size: 8px;
        font-weight: 950;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        margin-bottom: 7px;
      }
      .shipping-panel-head strong {
        display: block;
        color: white;
        font-size: 16px;
        font-weight: 950;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .shipping-security-chip {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 11px;
        border-radius: 12px;
        background: rgba(34,197,94,0.075);
        border: 1px solid rgba(34,197,94,0.18);
        color: #22c55e;
      }
      .shipping-security-chip span {
        margin: 0;
        color: #22c55e;
        font-size: 7px;
        letter-spacing: 0.16em;
      }
      .shipping-form-grid {
        display: grid;
        gap: 28px;
      }
      .address-mode-console {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 26px;
      }
      .address-mode-btn {
        min-height: 58px;
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 12px;
        padding: 0 14px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(0,0,0,0.34);
        color: rgba(255,255,255,0.42);
        transition: 0.22s ease;
      }
      .address-mode-btn span {
        text-align: left;
        color: rgba(255,255,255,0.56);
        font-size: 9px;
        font-weight: 950;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .address-mode-btn strong {
        color: rgba(255,255,255,0.22);
        font-size: 9px;
        font-weight: 950;
        letter-spacing: 0.14em;
      }
      .address-mode-btn.active {
        color: #fbbf24;
        border-color: rgba(251,191,36,0.34);
        background: linear-gradient(135deg, rgba(251,191,36,0.12), rgba(255,255,255,0.035));
        box-shadow: 0 18px 48px rgba(0,0,0,0.28);
      }
      .address-mode-btn.active span,
      .address-mode-btn.active strong { color: #fbbf24; }
      .address-mode-btn:disabled {
        opacity: 0.38;
        cursor: not-allowed;
      }
      .saved-address-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 28px;
      }
      .saved-address-card {
        text-align: left;
        min-height: 150px;
        padding: 16px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(0,0,0,0.35);
        transition: 0.22s ease;
      }
      .saved-address-card.selected {
        border-color: rgba(251,191,36,0.38);
        background: linear-gradient(135deg, rgba(251,191,36,0.1), rgba(0,0,0,0.4));
      }
      .saved-address-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        color: rgba(251,191,36,0.82);
        margin-bottom: 12px;
      }
      .saved-address-top span {
        font-size: 7px;
        font-weight: 950;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .saved-address-card strong {
        display: block;
        color: white;
        font-size: 13px;
        font-weight: 950;
        letter-spacing: 0.08em;
        margin-bottom: 8px;
      }
      .saved-address-card p {
        color: rgba(255,255,255,0.46);
        font-size: 10px;
        font-weight: 800;
        line-height: 1.55;
        min-height: 32px;
        margin-bottom: 12px;
      }
      .saved-address-card div:last-child {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .saved-address-card em {
        color: rgba(255,255,255,0.32);
        font-size: 8px;
        font-style: normal;
        font-weight: 950;
        letter-spacing: 0.1em;
      }
      .shipping-save-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        padding: 14px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.07);
        background: rgba(0,0,0,0.26);
      }
      .shipping-save-row span {
        color: rgba(255,255,255,0.38);
        font-size: 9px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .save-address-btn {
        height: 42px;
        padding: 0 16px;
        display: flex;
        align-items: center;
        gap: 9px;
        border-radius: 12px;
        background: white;
        color: black;
        font-size: 8px;
        font-weight: 950;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        transition: 0.2s ease;
        flex: 0 0 auto;
      }
      .save-address-btn:hover:not(:disabled) {
        background: #fbbf24;
        transform: translateY(-1px);
      }
      .save-address-btn:disabled {
        cursor: not-allowed;
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.28);
      }
      .shipping-form-panel .input-shell-flagship {
        min-height: 68px;
        border-radius: 16px;
        background: rgba(0,0,0,0.48);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
      }
      .shipping-form-panel .input-shell-flagship:focus-within {
        box-shadow: 0 0 34px rgba(251,191,36,0.12), inset 0 1px 0 rgba(255,255,255,0.06);
      }
      .country-select-shell {
        display: grid !important;
        grid-template-columns: 68px minmax(0, 1fr) 48px;
        align-items: stretch !important;
        padding: 0;
        background:
          linear-gradient(135deg, rgba(251,191,36,0.08), rgba(0,0,0,0.48)),
          rgba(0,0,0,0.48) !important;
      }
      .country-select-shell > div:first-child {
        display: grid;
        place-items: center;
        padding: 0 !important;
        border-right: 1px solid rgba(255,255,255,0.07);
      }
      .country-select-shell select {
        appearance: none;
        cursor: pointer;
        width: 100%;
        height: 100%;
        min-width: 0;
        padding-left: 18px;
        padding-right: 16px;
        background: transparent;
        letter-spacing: 0.12em;
        text-transform: none;
      }
      .country-select-shell option {
        background: #111113;
        color: #f8fafc;
        font-weight: 800;
      }
      .select-chevron {
        height: 100%;
        display: grid;
        place-items: center;
        padding: 0;
        color: rgba(251,191,36,0.8);
        pointer-events: none;
        border-left: 1px solid rgba(255,255,255,0.07);
      }
      .phone-dial-chip {
        margin-right: 12px;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(251,191,36,0.1);
        border: 1px solid rgba(251,191,36,0.24);
        color: #fbbf24;
        font-family: monospace;
        font-size: 11px;
        font-weight: 950;
        letter-spacing: 0.08em;
      }

      .cart-swipe-shell {
        position: relative;
        overflow: hidden;
        border-radius: 14px;
        touch-action: pan-y;
      }
      .swipe-delete-action {
        position: absolute;
        inset: 0;
        z-index: 0;
        width: 100%;
        padding-left: calc(100% - 112px);
        border: 1px solid rgba(239,68,68,0.32);
        border-radius: 14px;
        background:
          linear-gradient(90deg, rgba(10,10,12,0.96) 0%, rgba(10,10,12,0.94) calc(100% - 150px), rgba(127,29,29,0.88) calc(100% - 112px), rgba(239,68,68,0.95) 100%),
          linear-gradient(135deg, rgba(255,255,255,0.045), rgba(10,10,12,0.96));
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 7px;
        overflow: hidden;
        opacity: 0;
        pointer-events: none;
        box-shadow: inset 0 0 26px rgba(255,255,255,0.08), -18px 0 40px rgba(239,68,68,0.14);
        transition: opacity 0.18s ease;
      }
      .cart-swipe-shell.swiping .swipe-delete-action,
      .cart-swipe-shell.delete-open .swipe-delete-action {
        opacity: 1;
      }
      .cart-swipe-shell.delete-open .swipe-delete-action {
        pointer-events: auto;
      }
      .swipe-delete-action lucide-icon {
        position: relative;
        z-index: 2;
        filter: drop-shadow(0 8px 16px rgba(0,0,0,0.35));
      }
      .swipe-delete-action span:not(.delete-scan) {
        position: relative;
        z-index: 2;
        font-size: 7px;
        font-weight: 950;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .delete-scan {
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
        transform: translateX(-100%);
        animation: swipe-delete-scan 1.8s ease-in-out infinite;
      }
      .cart-product-node {
        position: relative;
        z-index: 2;
        overflow: hidden;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.075);
        background: linear-gradient(135deg, rgba(255,255,255,0.045), rgba(10,10,12,0.96));
        box-shadow: 0 24px 70px rgba(0,0,0,0.36);
        transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
        will-change: transform;
      }
      .cart-product-node:hover {
        border-color: rgba(251,191,36,0.28);
        background: linear-gradient(135deg, rgba(251,191,36,0.055), rgba(12,12,14,0.98));
        box-shadow: 0 28px 80px rgba(0,0,0,0.46);
      }
      .cart-swipe-shell.delete-open .cart-product-node {
        border-color: rgba(239,68,68,0.24);
        box-shadow: 0 26px 80px rgba(0,0,0,0.52);
      }
      .cart-card-accent {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: linear-gradient(180deg, transparent, #fbbf24, transparent);
        opacity: 0.85;
      }
      .cart-product-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 44px;
        padding: 12px 54px 12px 22px;
        border-bottom: 1px solid rgba(255,255,255,0.055);
        background: rgba(0,0,0,0.26);
      }
      .cart-product-header span {
        color: #e4e4e7;
        font-size: 8px;
        font-weight: 950;
        letter-spacing: 0.26em;
        text-transform: uppercase;
        white-space: nowrap;
      }
      .cart-product-header em {
        color: rgba(255,255,255,0.22);
        font-size: 8px;
        font-style: normal;
        font-family: monospace;
        font-weight: 950;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .cart-cert-dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: #fbbf24;
        box-shadow: 0 0 14px rgba(251,191,36,0.7);
        flex: 0 0 auto;
      }
      .cart-product-body {
        display: grid;
        grid-template-columns: 128px minmax(0, 1fr) auto;
        gap: 22px;
        align-items: center;
        padding: 18px 22px;
      }
      .cart-product-media {
        position: relative;
        width: 128px;
        height: 128px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border-radius: 14px;
        background: #0b0b0d;
        border: 1px solid rgba(255,255,255,0.07);
      }
      .cart-product-media .media-grid-lines {
        position: absolute;
        z-index: 3;
        inset: 0;
        opacity: 0.1;
        background-image: linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px);
        background-size: 18px 18px;
      }
      .cart-product-media .platform-base {
        position: absolute;
        z-index: 2;
        inset: 0;
        background: linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.46));
        pointer-events: none;
      }
      .cart-product-media img {
        position: absolute;
        inset: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.35s ease;
      }
      .cart-product-node:hover .cart-product-media img { transform: scale(1.04); }
      .cart-product-media .viz-reticle-box {
        position: absolute;
        z-index: 4;
        inset: 10px;
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 10px;
        pointer-events: none;
      }
      .cart-product-content { min-width: 0; }
      .cart-product-kicker {
        display: block;
        color: #fbbf24;
        font-size: 8px;
        font-weight: 950;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      .cart-product-content h4 {
        color: white;
        font-size: 24px;
        line-height: 1;
        font-weight: 950;
        letter-spacing: -0.02em;
        text-transform: uppercase;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
      }
      .cart-product-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 14px;
      }
      .cart-product-meta div {
        min-width: 112px;
        padding: 9px 10px;
        border-radius: 10px;
        background: rgba(255,255,255,0.035);
        border: 1px solid rgba(255,255,255,0.055);
      }
      .cart-product-meta span {
        display: block;
        color: rgba(255,255,255,0.25);
        font-size: 7px;
        font-weight: 950;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      .cart-product-meta strong {
        display: block;
        color: #e4e4e7;
        font-size: 10px;
        font-weight: 850;
        text-transform: uppercase;
        margin-top: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cart-product-actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 14px;
        min-width: 174px;
      }
      .cart-product-actions .price-display { text-align: right; }
      .cart-product-actions .price-display span {
        display: block;
        color: rgba(255,255,255,0.25);
        font-size: 7px;
        font-weight: 950;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        margin-bottom: 3px;
      }
      .cart-product-actions .price-display strong {
        color: white;
        font-family: monospace;
        font-size: 24px;
        font-weight: 950;
        line-height: 1;
      }
      .cart-product-actions .price-display em {
        color: #fbbf24;
        font-size: 10px;
        font-style: normal;
        margin-left: 3px;
      }
      .cart-product-actions .qty-control {
        display: grid;
        grid-template-columns: 34px 42px 34px;
        align-items: center;
        border-radius: 12px;
        background: rgba(0,0,0,0.42);
        border: 1px solid rgba(255,255,255,0.08);
        overflow: hidden;
      }
      .cart-product-actions .qty-control button {
        height: 34px;
        color: rgba(255,255,255,0.42);
        font-size: 16px;
        font-weight: 950;
        transition: 0.18s ease;
      }
      .cart-product-actions .qty-control button:hover { color: #fbbf24; background: rgba(251,191,36,0.08); }
      .cart-product-actions .qty-control span {
        color: white;
        text-align: center;
        font-family: monospace;
        font-size: 16px;
        font-weight: 950;
      }

      /* HORIZONTAL FLAGSHIP PAYMENT STYLES */
      .payment-command-header {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        padding: 20px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.08);
        background:
          linear-gradient(135deg, rgba(255,255,255,0.055), rgba(8,8,10,0.9)),
          radial-gradient(circle at 12% 0%, rgba(251,191,36,0.12), transparent 40%);
        box-shadow: 0 26px 80px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.06);
        overflow: hidden;
      }
      .payment-command-header::before {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 52px);
        opacity: 0.42;
        pointer-events: none;
      }
      .payment-title-block {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 16px;
        min-width: 0;
      }
      .payment-icon-core {
        width: 52px;
        height: 52px;
        display: grid;
        place-items: center;
        color: #fbbf24;
        border-radius: 14px;
        background: rgba(251,191,36,0.09);
        border: 1px solid rgba(251,191,36,0.28);
        box-shadow: 0 0 34px rgba(251,191,36,0.13);
      }
      .payment-title-block span {
        display: block;
        color: #fbbf24;
        font-size: 9px;
        font-weight: 950;
        letter-spacing: 0.32em;
        text-transform: uppercase;
        margin-bottom: 5px;
      }
      .payment-title-block h2 {
        color: white;
        font-size: 28px;
        font-weight: 950;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        line-height: 1;
      }
      .payment-trust-strip {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        min-width: 420px;
      }
      .payment-trust-strip div {
        padding: 11px 12px;
        border-radius: 13px;
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.07);
      }
      .payment-trust-strip span {
        display: block;
        color: rgba(255,255,255,0.3);
        font-size: 7px;
        font-weight: 950;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .payment-trust-strip strong {
        display: block;
        color: #fbbf24;
        font-size: 9px;
        font-weight: 950;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      .payment-vault-stage {
        max-width: 100%;
        box-sizing: border-box;
        min-height: 660px;
        gap: 32px !important;
        padding: 26px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.07);
        background:
          radial-gradient(circle at 30% 20%, rgba(251,191,36,0.08), transparent 34%),
          linear-gradient(135deg, rgba(255,255,255,0.035), rgba(0,0,0,0.25));
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
      }
      .payment-card-platform {
        min-width: 0;
        min-height: 620px;
        flex: 1 1 0;
        overflow: hidden;
        border-radius: 18px;
        background:
          linear-gradient(90deg, rgba(255,255,255,0.035), transparent 22%, transparent 78%, rgba(255,255,255,0.035)),
          radial-gradient(circle at 50% 50%, rgba(251,191,36,0.07), transparent 48%);
        border: 1px solid rgba(255,255,255,0.055);
      }
      .vault-orbit-ring {
        position: absolute;
        width: 540px;
        height: 540px;
        border-radius: 50%;
        border: 1px dashed rgba(251,191,36,0.18);
        animation: spin 38s linear infinite;
      }
      .vault-orbit-ring::after {
        content: '';
        position: absolute;
        inset: 44px;
        border-radius: 50%;
        border: 1px solid rgba(255,255,255,0.045);
      }
      .payment-rail-column {
        position: absolute;
        top: 42px;
        bottom: 42px;
        display: grid;
        align-content: space-between;
        width: 8px;
      }
      .payment-rail-column.left { left: 30px; }
      .payment-rail-column.right { right: 30px; }
      .payment-rail-column span {
        width: 8px;
        height: 78px;
        border-radius: 999px;
        background: linear-gradient(180deg, transparent, rgba(251,191,36,0.45), transparent);
        box-shadow: 0 0 20px rgba(251,191,36,0.16);
      }
      .payment-auth-panel {
        width: 420px !important;
        min-height: 620px;
        padding: 34px !important;
        border-radius: 18px;
        background:
          linear-gradient(135deg, rgba(255,255,255,0.055), rgba(17,17,19,0.96)),
          radial-gradient(circle at 100% 0%, rgba(251,191,36,0.08), transparent 38%);
      }
      .payment-auth-panel::before {
        content: '';
        position: absolute;
        inset: 0 0 auto;
        height: 3px;
        background: linear-gradient(90deg, #fbbf24, transparent 70%);
        box-shadow: 0 0 24px rgba(251,191,36,0.35);
      }
      .auth-panel-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
        padding-bottom: 24px;
        margin-bottom: 28px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
      }
      .auth-panel-head span {
        display: block;
        color: rgba(255,255,255,0.3);
        font-size: 8px;
        font-weight: 950;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        margin-bottom: 7px;
      }
      .auth-panel-head strong {
        display: block;
        color: white;
        font-size: 16px;
        font-weight: 950;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      .auth-live-chip {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 999px;
        background: rgba(34,197,94,0.08);
        border: 1px solid rgba(34,197,94,0.18);
      }
      .auth-live-chip div {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 14px rgba(34,197,94,0.75);
      }
      .auth-live-chip span {
        margin: 0;
        color: #22c55e;
        font-size: 7px;
      }
      .payment-form-grid {
        display: grid;
        gap: 28px;
      }
      .payment-auth-panel .input-shell-flagship {
        min-height: 64px;
        border-radius: 15px;
        background: rgba(0,0,0,0.5);
      }
      .stripe-card-element-shell { min-height: 64px; display: grid; grid-template-columns: auto 1fr; align-items: center; border-radius: 15px; background: rgba(0,0,0,0.56); border: 1px solid rgba(255,255,255,0.1); transition: 0.25s ease; }
      .stripe-card-element-shell:focus-within { border-color: rgba(251,191,36,0.42); box-shadow: 0 0 30px rgba(251,191,36,0.08); }
      .stripe-card-element { min-width: 0; padding: 22px 20px 22px 0; }
      .stripe-card-error { margin-top: 10px; color: #ef4444; font-size: 8px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; }
      .authorization-stack {
        display: grid;
        gap: 10px;
        margin-top: 6px;
        padding-top: 26px;
        border-top: 1px solid rgba(255,255,255,0.07);
      }
      .auth-layer {
        display: grid;
        grid-template-columns: 36px 1fr auto;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(0,0,0,0.26);
        color: rgba(255,255,255,0.28);
        transition: 0.24s ease;
      }
      .auth-layer.active {
        border-color: rgba(251,191,36,0.25);
        background: rgba(251,191,36,0.065);
        color: #fbbf24;
      }
      .auth-layer > lucide-icon {
        width: 36px;
        height: 36px;
        padding: 9px;
        border-radius: 11px;
        background: rgba(255,255,255,0.045);
      }
      .auth-layer span {
        display: block;
        color: rgba(255,255,255,0.3);
        font-size: 7px;
        font-weight: 950;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .auth-layer strong {
        display: block;
        color: white;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.05em;
        margin-top: 2px;
      }
      .auth-layer em {
        color: inherit;
        font-size: 7px;
        font-style: normal;
        font-weight: 950;
        letter-spacing: 0.12em;
      }
      .preserve-3d { transform-style: preserve-3d; }
      .backface-hidden { backface-visibility: hidden; }
      .rotate-y-180 { transform: rotateY(180deg); }

      .terminal-card-horizontal {
        cursor: pointer;
        width: min(100%, 610px) !important;
        height: 360px !important;
      }
      .terminal-card-horizontal.is-flipped { transform: rotateY(180deg); }
      .terminal-card-horizontal .side { transition: background 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease; }
      .terminal-card-horizontal.brand-visa .front { background: radial-gradient(circle at 15% 10%, rgba(56,189,248,0.28), transparent 34%), linear-gradient(135deg, #101827, #111113 58%, #172554); border-color: rgba(56,189,248,0.34); box-shadow: 0 80px 160px rgba(0,0,0,0.9), 0 0 60px rgba(56,189,248,0.12); }
      .terminal-card-horizontal.brand-mastercard .front { background: radial-gradient(circle at 18% 12%, rgba(239,68,68,0.24), transparent 30%), radial-gradient(circle at 78% 18%, rgba(251,191,36,0.22), transparent 34%), linear-gradient(135deg, #18110d, #111113 58%, #2a1208); border-color: rgba(251,191,36,0.34); }
      .terminal-card-horizontal.brand-amex .front { background: radial-gradient(circle at 20% 12%, rgba(20,184,166,0.26), transparent 34%), linear-gradient(135deg, #0f2524, #111113 62%, #134e4a); border-color: rgba(45,212,191,0.32); }
      .terminal-card-horizontal.brand-generic .front { background: radial-gradient(circle at 20% 12%, rgba(168,85,247,0.16), transparent 34%), linear-gradient(135deg, #16151c, #111113 62%, #1f1b2e); border-color: rgba(168,85,247,0.22); }
      .card-brand-chip { min-width: 116px; padding: 11px 13px; border-radius: 16px; background: rgba(0,0,0,0.38); border: 1px solid rgba(255,255,255,0.12); text-align: right; box-shadow: inset 0 1px 0 rgba(255,255,255,0.06); }
      .card-brand-chip span { display: block; color: rgba(255,255,255,0.42); font-size: 7px; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 4px; }
      .card-brand-chip strong { color: white; font-size: 14px; font-weight: 950; letter-spacing: 0.14em; font-family: monospace; }
      .payment-authorizing .payment-card-platform,
      .payment-authorizing .payment-auth-panel { pointer-events: none; }
      .payment-authorizing::after { content: ''; position: fixed; inset: 0; z-index: 19; background: rgba(5,5,6,0.46); backdrop-filter: blur(16px) saturate(1.25); pointer-events: none; }
      .isgaarti-payment-loader { position: fixed; left: 50%; top: 50%; z-index: 20; transform: translate(-50%, -50%); width: min(420px, calc(100vw - 44px)); min-height: 154px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 20px; background: rgba(5,5,6,0.78); border: 1px solid rgba(251,191,36,0.28); box-shadow: 0 34px 100px rgba(0,0,0,0.62), 0 0 70px rgba(251,191,36,0.12), inset 0 1px 0 rgba(255,255,255,0.07); overflow: hidden; backdrop-filter: blur(24px); }
      .loader-grid { position: absolute; inset: 0; opacity: 0.055; background-image: linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px); background-size: 28px 28px; animation: loader-grid-drift 2s linear infinite; }
      .loader-word { position: relative; color: #fbbf24; font-size: 34px; font-weight: 950; letter-spacing: 0.2em; line-height: 1; text-transform: uppercase; text-shadow: 0 0 34px rgba(251,191,36,0.28); }
      .loader-word::before { content: attr(data-word); position: absolute; inset: 0; width: 0; overflow: hidden; color: white; border-right: 3px solid #fbbf24; animation: isgaarti-rewrite 1.15s steps(8) infinite; }
      .loader-status { position: relative; margin-top: 14px; text-align: center; max-width: 280px; }
      .loader-status span { display: block; color: rgba(255,255,255,0.48); font-size: 7px; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 6px; }
      .loader-status strong { display: block; color: white; font-size: 8px; font-weight: 950; letter-spacing: 0.14em; text-transform: uppercase; }
      .loader-progress { position: relative; width: 220px; height: 4px; margin-top: 16px; border-radius: 999px; overflow: hidden; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.08); }
      .loader-progress div { width: 42%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, transparent, #fbbf24, #22c55e); animation: loader-progress-scan 1.05s ease-in-out infinite; box-shadow: 0 0 18px rgba(251,191,36,0.36); }
      /* FIXED: Removed hover tilt as requested */
      .terminal-card-horizontal .front,
      .terminal-card-horizontal .back {
        border-radius: 36px !important;
        padding: 36px !important;
      }
      .terminal-card-horizontal .card-number-clean {
        max-width: 100%;
        overflow: hidden;
        text-overflow: clip;
        font-size: clamp(28px, 2.35vw, 36px) !important;
        letter-spacing: 0.13em !important;
        margin-bottom: 50px !important;
      }

      .confirmation-command-center {
        position: relative;
        min-height: 720px;
        padding: 12px 0 0;
        overflow: visible;
        border-radius: 0;
        border: 0;
        background: transparent;
        box-shadow: none;
      }
      .confirmation-command-center::before {
        content: '';
        position: absolute;
        inset: -110px -14vw -80px;
        background:
          linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px),
          linear-gradient(180deg, rgba(255,255,255,0.03) 1px, transparent 1px);
        background-size: 58px 58px;
        opacity: 0.12;
        mask-image: radial-gradient(ellipse at center, black 0 54%, transparent 82%);
        pointer-events: none;
      }
      .confirmation-command-center::after {
        content: '';
        position: absolute;
        inset: -140px -18vw -120px;
        background: transparent;
        pointer-events: none;
      }
      .confirmation-scanline {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 3px;
        background: linear-gradient(90deg, #fbbf24, rgba(251,191,36,0.45) 42%, transparent 88%);
        box-shadow: 0 0 28px rgba(251,191,36,0.2);
      }
      .confirmation-hero-grid {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 220px;
        gap: 40px;
        align-items: center;
        margin-bottom: 46px;
        padding: 34px 0 38px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        min-height: 320px;
      }
      .confirmation-hero-grid::before {
        content: '';
        position: absolute;
        inset: 0 -5vw;
        z-index: -1;
        border-top: 0;
        border-bottom: 0;
        background: transparent;
        mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
      }
      .confirmation-kicker {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 18px;
      }
      .confirmation-kicker span {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 20px rgba(34,197,94,0.9);
      }
      .confirmation-kicker strong {
        color: #fbbf24;
        font-size: 9px;
        font-weight: 950;
        letter-spacing: 0.32em;
        text-transform: uppercase;
      }
      .confirmation-copy h2 {
        color: white;
        font-size: clamp(52px, 5vw, 86px);
        font-weight: 950;
        line-height: 0.9;
        letter-spacing: 0;
        text-transform: uppercase;
        max-width: 820px;
      }
      .confirmation-hero-title {
        position: relative;
        padding-left: 22px;
      }
      .confirmation-hero-title::before {
        content: '';
        position: absolute;
        left: 0;
        top: 4px;
        bottom: 6px;
        width: 4px;
        border-radius: 999px;
        background: #fbbf24;
        box-shadow: 0 0 24px rgba(251,191,36,0.55);
      }
      .confirmation-hero-title > span {
        display: block;
        color: rgba(251,191,36,0.86);
        font-size: 10px;
        font-weight: 950;
        letter-spacing: 0.38em;
        text-transform: uppercase;
        margin-bottom: 12px;
      }
      .confirmation-copy p {
        color: rgba(255,255,255,0.48);
        font-size: 15px;
        font-weight: 700;
        line-height: 1.7;
        max-width: 620px;
        margin-top: 22px;
      }
      .confirmation-seal {
        position: relative;
        width: 210px;
        height: 210px;
        display: grid;
        place-items: center;
      }
      .seal-orbit {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 1px dashed rgba(34,197,94,0.34);
        animation: spin 28s linear infinite;
      }
      .seal-core-confirmed {
        width: 118px;
        height: 118px;
        display: grid;
        place-items: center;
        border-radius: 32px;
        color: #22c55e;
        background: rgba(34,197,94,0.1);
        border: 1px solid rgba(34,197,94,0.28);
        box-shadow: 0 0 44px rgba(34,197,94,0.12);
      }
      .confirmation-seal > span {
        position: absolute;
        bottom: 24px;
        color: #fbbf24;
        font-size: 8px;
        font-weight: 950;
        letter-spacing: 0.22em;
        text-transform: uppercase;
      }
      .confirmation-dashboard {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: minmax(360px, 0.82fr) minmax(0, 1.18fr);
        gap: 38px;
        align-items: stretch;
      }
      .receipt-capsule { padding: 24px; }
      .confirmation-ticket {
        position: relative;
        overflow: visible;
        border-radius: 20px;
        background:
          linear-gradient(135deg, rgba(255,255,255,0.08), rgba(251,191,36,0.09) 44%, rgba(0,0,0,0.34)),
          #101011;
        border: 1px solid rgba(251,191,36,0.28);
        box-shadow: 0 30px 90px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.08);
      }
      .confirmation-ticket::before,
      .confirmation-ticket::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #070708;
        border: 1px solid rgba(251,191,36,0.18);
        transform: translateY(-50%);
        z-index: 2;
      }
      .confirmation-ticket::before { left: -18px; }
      .confirmation-ticket::after { right: -18px; }
      .confirmation-ticket .receipt-head {
        border-bottom-style: dashed;
        border-bottom-color: rgba(251,191,36,0.24);
      }
      .ticket-perforation {
        height: 1px;
        margin: 0 0 18px;
        background-image: linear-gradient(90deg, rgba(251,191,36,0.45) 0 10px, transparent 10px 20px);
        opacity: 0.55;
      }
      .ticket-footer-strip {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 16px;
        align-items: center;
        margin-top: 18px;
        padding-top: 16px;
        border-top: 1px dashed rgba(255,255,255,0.12);
      }
      .ticket-footer-strip span {
        color: rgba(255,255,255,0.34);
        font-size: 8px;
        font-weight: 950;
        letter-spacing: 0.22em;
      }
      .ticket-barcode {
        height: 42px;
        border-radius: 8px;
        opacity: 0.74;
        background:
          repeating-linear-gradient(90deg, #fbbf24 0 2px, transparent 2px 6px, #fbbf24 6px 9px, transparent 9px 14px, #fbbf24 14px 15px, transparent 15px 21px);
        mask-image: linear-gradient(180deg, transparent, black 18%, black 82%, transparent);
      }
      .receipt-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
        padding-bottom: 22px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        color: #fbbf24;
      }
      .receipt-head span,
      .receipt-amount span,
      .receipt-grid span {
        display: block;
        color: rgba(255,255,255,0.32);
        font-size: 8px;
        font-weight: 950;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        margin-bottom: 7px;
      }
      .receipt-head strong {
        color: #fbbf24;
        font-family: monospace;
        font-size: 24px;
        font-weight: 950;
        letter-spacing: 0.08em;
      }
      .receipt-amount {
        padding: 26px 0;
      }
      .receipt-amount strong {
        color: white;
        font-family: monospace;
        font-size: 42px;
        font-weight: 950;
        line-height: 1;
      }
      .receipt-amount em {
        color: #fbbf24;
        font-size: 13px;
        font-style: normal;
      }
      .receipt-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      .receipt-grid div {
        padding: 13px;
        border-radius: 14px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
      }
      .receipt-grid strong {
        color: white;
        font-size: 13px;
        font-weight: 950;
        text-transform: uppercase;
      }
      .fulfillment-line-board {
        min-height: 100%;
        display: flex;
        align-items: center;
        padding: 12px 0;
        background: transparent;
        border: 0;
      }
      .fulfillment-track {
        position: relative;
        width: 100%;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
        align-items: start;
      }
      .track-beam {
        position: absolute;
        left: 7%;
        right: 7%;
        top: 30px;
        height: 2px;
        border-radius: 999px;
        background: rgba(255,255,255,0.12);
      }
      .track-beam-active {
        position: absolute;
        left: 7%;
        width: 36%;
        top: 30px;
        height: 2px;
        border-radius: 999px;
        background: linear-gradient(90deg, #22c55e, #fbbf24);
        box-shadow: 0 0 26px rgba(251,191,36,0.18);
      }
      .fulfillment-line-step {
        position: relative;
        z-index: 1;
        display: grid;
        justify-items: center;
        gap: 12px;
        text-align: center;
      }
      .fulfillment-line-step div {
        width: 62px;
        height: 62px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        color: var(--status-color);
        background: #0b0b0d;
        border: 1px solid rgba(255,255,255,0.1);
        box-shadow: 0 18px 42px rgba(0,0,0,0.32);
      }
      .fulfillment-line-step span {
        color: white;
        font-size: 11px;
        font-weight: 950;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      .fulfillment-line-step strong {
        color: var(--status-color);
        font-size: 8px;
        font-weight: 950;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .fulfillment-line-step::after {
        content: '';
        width: 28px;
        height: 3px;
        border-radius: 999px;
        background: var(--status-color);
        box-shadow: 0 0 14px var(--status-color);
        opacity: 0.8;
      }
      .fulfillment-line-step.payment { --status-color: #22c55e; }
      .fulfillment-line-step.prep { --status-color: #fbbf24; }
      .fulfillment-line-step.route { --status-color: #38bdf8; }
      .fulfillment-line-step.delivery { --status-color: #a78bfa; }
      .fulfillment-line-step.payment div { border-color: rgba(34,197,94,0.38); }
      .fulfillment-line-step.prep div { border-color: rgba(251,191,36,0.42); }
      .fulfillment-line-step.route div { border-color: rgba(56,189,248,0.38); }
      .fulfillment-line-step.delivery div { border-color: rgba(167,139,250,0.38); }
      .confirmation-intel-grid {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
        margin-top: 42px;
        padding-top: 30px;
        border-top: 1px solid rgba(255,255,255,0.07);
      }
      .intel-node {
        position: relative;
        min-height: 156px;
        padding: 22px 0 0;
        border-top: 3px solid rgba(255,255,255,0.08);
      }
      .intel-node lucide-icon { color: #fbbf24; margin-bottom: 16px; }
      .intel-node span {
        display: block;
        color: rgba(255,255,255,0.32);
        font-size: 8px;
        font-weight: 950;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        margin-bottom: 7px;
      }
      .intel-node strong {
        display: block;
        color: white;
        font-size: 15px;
        font-weight: 950;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        margin-bottom: 9px;
      }
      .intel-node p {
        color: rgba(255,255,255,0.46);
        font-size: 11px;
        font-weight: 750;
        line-height: 1.65;
        max-width: 320px;
      }
      .fulfillment-row {
        position: relative;
        display: grid;
        grid-template-columns: 44px 1fr auto;
        align-items: center;
        gap: 14px;
        min-height: 72px;
        padding: 13px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.065);
        background: rgba(255,255,255,0.035);
        overflow: hidden;
      }
      .fulfillment-row::before {
        content: '';
        position: absolute;
        left: 0;
        top: 12px;
        bottom: 12px;
        width: 3px;
        border-radius: 999px;
        background: var(--status-color, #71717a);
      }
      .fulfillment-row div {
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border-radius: 13px;
        color: rgba(255,255,255,0.35);
        background: rgba(255,255,255,0.045);
      }
      .fulfillment-row span {
        color: white;
        font-size: 12px;
        font-weight: 950;
        letter-spacing: 0.09em;
        text-transform: uppercase;
      }
      .fulfillment-row strong {
        color: var(--status-color, rgba(255,255,255,0.3));
        font-size: 8px;
        font-weight: 950;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .fulfillment-row.payment { --status-color: #22c55e; border-color: rgba(34,197,94,0.18); }
      .fulfillment-row.prep { --status-color: #fbbf24; border-color: rgba(251,191,36,0.22); }
      .fulfillment-row.route { --status-color: #38bdf8; border-color: rgba(56,189,248,0.18); }
      .fulfillment-row.delivery { --status-color: #a78bfa; border-color: rgba(167,139,250,0.18); }
      .fulfillment-row div { color: var(--status-color, rgba(255,255,255,0.35)); }
      .fulfillment-row.payment div { background: rgba(34,197,94,0.1); }
      .fulfillment-row.prep div { background: rgba(251,191,36,0.11); }
      .fulfillment-row.route div { background: rgba(56,189,248,0.1); }
      .fulfillment-row.delivery div { background: rgba(167,139,250,0.1); }
      .fulfillment-row.payment::before { box-shadow: 0 0 18px rgba(34,197,94,0.5); }
      .fulfillment-row.prep::before { box-shadow: 0 0 18px rgba(251,191,36,0.5); }
      .fulfillment-row.route::before { box-shadow: 0 0 18px rgba(56,189,248,0.5); }
      .fulfillment-row.delivery::before { box-shadow: 0 0 18px rgba(167,139,250,0.5); }
      .fulfillment-row.active { box-shadow: 0 0 34px rgba(251,191,36,0.07); }
      .confirmation-actions {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 28px;
      }
      .confirmation-btn {
        height: 48px;
        padding: 0 18px;
        display: flex;
        align-items: center;
        gap: 10px;
        border-radius: 13px;
        font-size: 9px;
        font-weight: 950;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        transition: 0.2s ease;
      }
      .confirmation-btn.primary {
        background: white;
        color: black;
      }
      .confirmation-btn.secondary {
        background: rgba(255,255,255,0.055);
        color: rgba(255,255,255,0.72);
        border: 1px solid rgba(255,255,255,0.09);
      }
      .confirmation-btn:hover { transform: translateY(-1px); }

      .glass-glare { background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%); transform: translateX(-100%); animation: glare 10s infinite; }
      @keyframes glare { 0% { transform: translateX(-100%); } 15% { transform: translateX(100%); } 100% { transform: translateX(100%); } }

      .chip-flagship .chip-texture { background: linear-gradient(to right, transparent 45%, #fbbf24 48%, #fbbf24 52%, transparent 55%); background-size: 10px 100%; opacity: 0.3; }

      .order-state-panel { position: relative; background: linear-gradient(180deg, rgba(17,17,19,0.98), rgba(8,8,10,0.98)); }
      .order-state-panel::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(135deg, rgba(251,191,36,0.08), transparent 36%, rgba(255,255,255,0.025)); }
      .order-state-header { position: relative; z-index: 1; padding: 24px 28px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; background: rgba(0,0,0,0.34); }
      .order-state-eyebrow { display: block; color: #fbbf24; font-size: 8px; font-weight: 950; letter-spacing: 0.28em; text-transform: uppercase; margin-bottom: 8px; }
      .order-state-header h3 { color: white; font-size: 18px; font-weight: 950; letter-spacing: 0.08em; text-transform: uppercase; line-height: 1.1; }
      .order-live-badge { display: flex; align-items: center; gap: 8px; padding: 7px 9px; border-radius: 999px; background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.18); }
      .order-live-badge div { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 12px rgba(34,197,94,0.8); }
      .order-live-badge span { color: #22c55e; font-size: 7px; font-weight: 950; letter-spacing: 0.18em; }

      .order-phase-card { position: relative; z-index: 1; margin: 20px; padding: 18px; display: grid; grid-template-columns: 90px 1fr; gap: 18px; align-items: center; border-radius: 14px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07); }
      .phase-orbit { position: relative; width: 84px; height: 84px; display: grid; place-items: center; }
      .phase-orbit svg { position: absolute; inset: 0; transform: rotate(-90deg); }
      .phase-orbit circle { fill: transparent; stroke-width: 5; stroke: rgba(255,255,255,0.08); }
      .phase-orbit circle:nth-child(2) { stroke: #fbbf24; stroke-dasharray: 226.19; transition: stroke-dashoffset 0.7s ease; filter: drop-shadow(0 0 10px rgba(251,191,36,0.35)); }
      .phase-orbit div { position: relative; text-align: center; }
      .phase-orbit strong { color: #fbbf24; font-family: monospace; font-size: 28px; font-weight: 950; line-height: 1; }
      .phase-orbit span { color: rgba(255,255,255,0.26); font-size: 10px; font-weight: 900; }
      .phase-copy span { display: block; color: rgba(255,255,255,0.28); font-size: 8px; font-weight: 950; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 5px; }
      .phase-copy strong { display: block; color: white; font-size: 15px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.08em; }
      .phase-copy p { color: #a1a1aa; font-size: 11px; line-height: 1.55; font-weight: 700; margin-top: 7px; }

      .order-progress-rail { position: relative; z-index: 1; padding: 4px 20px 18px; display: grid; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); }
      .order-progress-row { display: grid; grid-template-columns: 38px 1fr auto; gap: 12px; align-items: center; padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.22); }
      .order-progress-row.active { border-color: rgba(251,191,36,0.28); background: rgba(251,191,36,0.07); }
      .order-progress-row.done { border-color: rgba(34,197,94,0.18); }
      .progress-node { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); }
      .order-progress-row.active .progress-node { color: #000; background: #fbbf24; border-color: #fbbf24; }
      .order-progress-row.done .progress-node { color: #22c55e; border-color: rgba(34,197,94,0.28); }
      .progress-copy span { display: block; color: rgba(255,255,255,0.24); font-size: 7px; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; }
      .progress-copy strong { display: block; color: white; font-size: 10px; font-weight: 950; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 2px; }
      .order-progress-row em { color: rgba(255,255,255,0.22); font-size: 7px; font-style: normal; font-weight: 950; letter-spacing: 0.12em; text-transform: uppercase; }
      .order-progress-row.active em { color: #fbbf24; }
      .order-progress-row.done em { color: #22c55e; }

      .free-shipping-console { position: relative; z-index: 1; padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); background: linear-gradient(135deg, rgba(251,191,36,0.065), rgba(255,255,255,0.018) 48%, rgba(0,0,0,0.18)); overflow: hidden; }
      .free-shipping-console::before { content: ''; position: absolute; inset: 10px; border-radius: 16px; border: 1px solid rgba(251,191,36,0.12); pointer-events: none; }
      .free-shipping-console::after { content: ''; position: absolute; top: 0; left: 20px; right: 20px; height: 1px; background: linear-gradient(90deg, transparent, rgba(251,191,36,0.5), transparent); opacity: 0.55; }
      .free-shipping-head { position: relative; display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
      .free-shipping-icon { width: 38px; height: 38px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 12px; color: #fbbf24; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.22); box-shadow: 0 0 22px rgba(251,191,36,0.08); }
      .free-shipping-head span { display: block; color: rgba(255,255,255,0.34); font-size: 8px; font-weight: 950; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 4px; }
      .free-shipping-head strong { display: block; color: white; font-size: 13px; font-weight: 950; letter-spacing: 0.06em; text-transform: uppercase; }
      .free-shipping-track { position: relative; height: 8px; border-radius: 999px; overflow: hidden; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.07); }
      .free-shipping-track div { height: 100%; min-width: 6px; border-radius: inherit; background: linear-gradient(90deg, #fbbf24, #22c55e); box-shadow: 0 0 16px rgba(251,191,36,0.34); transition: width 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
      .free-shipping-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
      .free-shipping-meta span, .free-shipping-meta strong { color: rgba(255,255,255,0.32); font-size: 8px; font-weight: 950; letter-spacing: 0.12em; text-transform: uppercase; }
      .free-shipping-meta strong { color: rgba(251,191,36,0.82); }
      .shipping-price-chip { position: relative; margin-top: 12px; display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 12px; background: rgba(0,0,0,0.34); border: 1px solid rgba(255,255,255,0.07); }
      .shipping-price-chip span { color: rgba(255,255,255,0.3); font-size: 8px; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; }
      .shipping-price-chip strong { color: #fbbf24; font-size: 10px; font-weight: 950; letter-spacing: 0.12em; font-family: monospace; }
      .free-shipping-console.unlocked { background: linear-gradient(135deg, rgba(34,197,94,0.08), rgba(251,191,36,0.045), rgba(0,0,0,0.18)); }
      .free-shipping-console.unlocked::before { border-color: rgba(34,197,94,0.2); box-shadow: 0 0 30px rgba(34,197,94,0.08); }
      .free-shipping-console.unlocked .free-shipping-icon { color: #22c55e; background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.24); }
      .free-shipping-console.unlocked .shipping-price-chip strong { color: #22c55e; }

      .order-manifest { position: relative; z-index: 1; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); background: linear-gradient(180deg, rgba(255,255,255,0.035), transparent); }
      .order-section-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
      .order-section-title span { color: rgba(255,255,255,0.34); font-size: 8px; font-weight: 950; letter-spacing: 0.28em; text-transform: uppercase; }
      .order-section-title strong { color: #fbbf24; font-size: 8px; font-weight: 950; letter-spacing: 0.14em; text-transform: uppercase; }
      .order-mini-asset { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 12px; background: rgba(0,0,0,0.34); border: 1px solid rgba(255,255,255,0.06); transition: 0.22s ease; }
      .order-mini-asset:hover { border-color: rgba(251,191,36,0.28); background: rgba(251,191,36,0.045); }
      .order-mini-asset .a-img { width: 42px; height: 42px; flex: 0 0 auto; padding: 8px; border-radius: 10px; background: #050506; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
      .order-mini-asset .a-name { color: white; display: block; font-size: 10px; font-weight: 850; text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .order-mini-asset .a-price { display: block; color: rgba(255,255,255,0.34); font-size: 8px; font-weight: 900; font-family: monospace; margin-top: 2px; }
      .order-mini-asset .a-qty { padding: 4px 7px; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #fbbf24; font-size: 8px; font-weight: 950; }
      .order-promo-terminal { position: relative; z-index: 1; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.18); }
      .promo-orbital { position: relative; display: grid; gap: 13px; }
      .order-promo-terminal::before { content: ''; position: absolute; inset: 12px; border-radius: 16px; border: 1px solid transparent; pointer-events: none; transition: 0.35s ease; }
      .order-promo-terminal.promo-success::before { border-color: rgba(251,191,36,0.28); box-shadow: 0 0 34px rgba(251,191,36,0.08); }
      .order-promo-terminal.promo-error::before { border-color: rgba(239,68,68,0.24); box-shadow: 0 0 28px rgba(239,68,68,0.08); }
      .promo-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
      .promo-title-row label { display: block; color: rgba(255,255,255,0.28); font-size: 8px; font-weight: 950; letter-spacing: 0.32em; text-transform: uppercase; margin-bottom: 5px; }
      .promo-title-row span { display: block; color: #71717a; font-size: 9px; font-weight: 800; line-height: 1.4; }
      .promo-state-pill { flex: 0 0 auto; padding: 6px 8px; border-radius: 999px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); color: rgba(255,255,255,0.36); font-size: 7px; font-weight: 950; letter-spacing: 0.16em; }
      .promo-state-pill.success { background: rgba(251,191,36,0.1); border-color: rgba(251,191,36,0.28); color: #fbbf24; }
      .promo-state-pill.error { background: rgba(239,68,68,0.09); border-color: rgba(239,68,68,0.22); color: #ef4444; }
      .flagship-promo-input { display: grid; grid-template-columns: 38px 1fr auto; align-items: center; gap: 8px; padding: 7px; border-radius: 14px; background: rgba(0,0,0,0.56); border: 1px solid rgba(255,255,255,0.08); transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease; }
      .flagship-promo-input:focus-within { border-color: rgba(251,191,36,0.4); box-shadow: 0 0 28px rgba(251,191,36,0.08); transform: translateY(-1px); }
      .promo-success .flagship-promo-input { border-color: rgba(34,197,94,0.28); }
      .promo-error .flagship-promo-input { border-color: rgba(239,68,68,0.32); animation: promo-shake 0.28s ease; }
      .promo-icon { width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; background: rgba(255,255,255,0.04); color: #fbbf24; border: 1px solid rgba(255,255,255,0.07); }
      .flagship-promo-input input { min-width: 0; background: transparent; border: 0; outline: none; color: white; font-size: 10px; font-weight: 950; letter-spacing: 0.14em; text-transform: uppercase; }
      .flagship-promo-input input::placeholder { color: rgba(255,255,255,0.12); }
      .flagship-promo-input input:disabled { color: #f8fafc; cursor: not-allowed; opacity: 1; text-shadow: 0 0 18px rgba(251,191,36,0.24); }
      .flagship-promo-input button { height: 38px; padding: 0 14px; border-radius: 11px; background: white; color: black; font-size: 8px; font-weight: 950; letter-spacing: 0.18em; transition: 0.22s ease; }
      .flagship-promo-input button:hover { background: #fbbf24; transform: translateX(1px); }
      .flagship-promo-input button:disabled { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.26); cursor: not-allowed; transform: none; }
      .promo-locked .flagship-promo-input { background: linear-gradient(135deg, rgba(251,191,36,0.1), rgba(0,0,0,0.62)); border-color: rgba(251,191,36,0.4); box-shadow: 0 0 34px rgba(251,191,36,0.08), inset 0 1px 0 rgba(255,255,255,0.06); }
      .promo-locked .promo-icon { color: #fbbf24; border-color: rgba(251,191,36,0.28); background: rgba(251,191,36,0.09); }
      .promo-feedback { display: flex; align-items: center; gap: 8px; padding: 10px 11px; border-radius: 12px; font-size: 9px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; animation: promo-reveal 0.32s ease both; }
      .promo-feedback.success { color: #fbbf24; background: rgba(251,191,36,0.075); border: 1px solid rgba(251,191,36,0.18); }
      .promo-feedback.error { color: #ef4444; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.16); }
      .promo-lock-seal { position: relative; overflow: hidden; border-radius: 14px; background: linear-gradient(135deg, rgba(251,191,36,0.12), rgba(255,255,255,0.035)); border: 1px solid rgba(251,191,36,0.22); animation: promo-seal-in 0.42s cubic-bezier(0.16, 1, 0.3, 1) both; box-shadow: 0 18px 42px rgba(0,0,0,0.22); }
      .seal-line { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent); transform: translateX(-100%); animation: promo-seal-scan 1.35s ease-out 0.1s both; }
      .seal-core { position: relative; display: flex; align-items: center; gap: 11px; padding: 12px; color: #fbbf24; }
      .seal-icon { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; background: rgba(0,0,0,0.35); border: 1px solid rgba(251,191,36,0.22); flex: 0 0 auto; }
      .seal-core strong { display: block; color: #f8fafc; font-size: 10px; font-weight: 950; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 3px; }
      .seal-core span { display: block; color: rgba(251,191,36,0.82); font-size: 8px; font-weight: 850; letter-spacing: 0.1em; text-transform: uppercase; }
      .promo-impact-card { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; animation: promo-reveal 0.35s ease both; }
      .promo-impact-card div { padding: 10px; border-radius: 12px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07); }
      .promo-impact-card span { display: block; color: rgba(255,255,255,0.34); font-size: 7px; font-weight: 950; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 5px; }
      .promo-impact-card strong { display: block; color: #fbbf24; font-size: 10px; font-weight: 950; font-family: monospace; }
      .promo-row-discount { animation: promo-reveal 0.3s ease both; }
      .stripe-feedback { margin-top: 14px; display: flex; align-items: center; gap: 9px; padding: 11px 12px; border-radius: 12px; background: rgba(251,191,36,0.075); border: 1px solid rgba(251,191,36,0.18); color: #fbbf24; font-size: 8px; font-weight: 950; letter-spacing: 0.12em; text-transform: uppercase; animation: promo-reveal 0.3s ease both; }
      .stripe-feedback.error { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.18); color: #ef4444; }
      .stripe-feedback.success { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.18); color: #22c55e; }
      .stripe-embedded-checkout-shell { position: relative; z-index: 2; width: 100%; min-height: 680px; padding: 24px; border-radius: 20px; background: linear-gradient(135deg, rgba(255,255,255,0.055), rgba(8,8,10,0.94)); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 34px 90px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06); overflow: hidden; }
      .stripe-embedded-checkout-shell::before { content: ''; position: absolute; inset: 0 0 auto; height: 3px; background: linear-gradient(90deg, #635bff, #fbbf24, transparent); box-shadow: 0 0 30px rgba(99,91,255,0.24); }
      .stripe-embedded-head { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 4px 2px 22px; margin-bottom: 18px; border-bottom: 1px solid rgba(255,255,255,0.07); }
      .stripe-embedded-head span { display: block; color: rgba(255,255,255,0.35); font-size: 8px; font-weight: 950; letter-spacing: 0.24em; text-transform: uppercase; margin-bottom: 6px; }
      .stripe-embedded-head strong { display: block; color: white; font-size: 18px; font-weight: 950; letter-spacing: 0.08em; text-transform: uppercase; }
      .stripe-embedded-badge { display: flex; align-items: center; gap: 9px; padding: 10px 12px; border-radius: 999px; color: #fbbf24; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); }
      .stripe-embedded-badge span { margin: 0; color: #fbbf24; font-size: 7px; }
      .stripe-embedded-mount { position: relative; z-index: 1; min-height: 560px; border-radius: 16px; background: #fff; overflow: hidden; }
      @keyframes promo-reveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes promo-shake { 0%, 100% { transform: translateX(0); } 35% { transform: translateX(-4px); } 70% { transform: translateX(4px); } }
      @keyframes promo-seal-in { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      @keyframes promo-seal-scan { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
      .cart-footer { margin-top: 34px; padding: 18px 2px; display: flex; align-items: center; justify-content: space-between; gap: 20px; border-top: 1px solid rgba(255,255,255,0.06); color: #71717a; }
      .footer-brand { color: #fbbf24; font-size: 10px; font-weight: 950; letter-spacing: 0.22em; text-transform: uppercase; }
      .footer-copy { color: #71717a; font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; text-align: right; }

      .action-button-flagship { box-shadow: 0 6px 0 rgba(0,0,0,0.1); }
      /* FIXED: Removed hover lift and shadow as requested */

      .custom-scrollbar::-webkit-scrollbar { width: 3px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

      @keyframes scan { from { transform: translateY(-100vh); } to { transform: translateY(100vh); } }
      @keyframes glitch { 0% { transform: translate(0); } 20% { transform: translate(-2px, 2px); } 40% { transform: translate(-2px, -2px); } 60% { transform: translate(2px, 2px); } 80% { transform: translate(2px, -2px); } 100% { transform: translate(0); } }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes swipe-delete-scan { 0% { transform: translateX(-100%); } 50%, 100% { transform: translateX(100%); } }
      @keyframes isgaarti-rewrite { 0% { width: 0; } 45% { width: 100%; } 70% { width: 100%; } 100% { width: 0; } }
      @keyframes loader-progress-scan { from { transform: translateX(-105%); } to { transform: translateX(245%); } }
      @keyframes loader-grid-drift { from { transform: translateY(0); } to { transform: translateY(44px); } }

      @media (max-width: 1200px) {
        .workspace-layout { grid-template-columns: 1fr; }
        .acquisition-terminal { position: static; margin-top: 60px; }
        .payment-vault-horizontal { flex-direction: column; }
        .form-container-compact-side { width: 100%; }
        .shipping-main-grid { grid-template-columns: 1fr; }
        .payment-vault-stage { min-height: auto; }
        .payment-card-platform { width: 100%; min-height: 560px; }
      }
      @media (max-width: 900px) {
        .payment-command-header { align-items: stretch; flex-direction: column; }
        .payment-trust-strip { min-width: 0; width: 100%; }
        .confirmation-hero-grid,
        .confirmation-dashboard { grid-template-columns: 1fr; }
        .confirmation-intel-grid { grid-template-columns: 1fr; }
        .confirmation-seal { margin: 0 auto; }
        .logistics-command-header { align-items: stretch; flex-direction: column; }
        .logistics-eta { width: 100%; }
        .cart-product-body { grid-template-columns: 112px 1fr; }
        .cart-product-media { width: 112px; height: 112px; }
        .cart-product-actions { grid-column: 1 / -1; flex-direction: row; align-items: center; justify-content: space-between; min-width: 0; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.06); }
        .cart-product-actions .price-display { text-align: left; }
      }
      @media (max-width: 760px) {
        .confirmation-command-center { padding: 8px 0 0; min-height: auto; }
        .confirmation-copy h2 { font-size: 42px; }
        .confirmation-actions { align-items: stretch; flex-direction: column; }
        .confirmation-btn { justify-content: center; width: 100%; }
        .receipt-grid { grid-template-columns: 1fr; }
        .ticket-footer-strip { grid-template-columns: 1fr; }
        .fulfillment-line-board { padding: 22px 0; overflow-x: auto; }
        .fulfillment-track { min-width: 620px; }
        .payment-title-block h2 { font-size: 22px; }
        .payment-trust-strip { grid-template-columns: 1fr; }
        .payment-vault-stage { padding: 18px; }
        .payment-card-platform { min-height: 420px; }
        .terminal-card-horizontal { width: min(100%, 360px) !important; height: 220px !important; }
        .terminal-card-horizontal .front,
        .terminal-card-horizontal .back { border-radius: 24px !important; padding: 24px !important; }
        .card-number-clean { font-size: 18px !important; margin-bottom: 28px !important; }
        .vault-orbit-ring { width: 340px; height: 340px; }
        .payment-rail-column { display: none; }
        .payment-auth-panel { min-height: auto; padding: 28px !important; }
        .shipping-form-panel { padding: 28px !important; min-height: auto; }
        .shipping-panel-head { align-items: flex-start; flex-direction: column; }
        .logistics-two-col { grid-template-columns: 1fr; }
        .address-mode-console,
        .saved-address-grid { grid-template-columns: 1fr; }
        .shipping-save-row { align-items: stretch; flex-direction: column; }
        .save-address-btn { justify-content: center; width: 100%; }
        .cart-footer { flex-direction: column; align-items: flex-start; }
        .footer-copy { text-align: left; }
      }
      @media (max-width: 620px) {
        .cart-product-body { grid-template-columns: 1fr; }
        .cart-product-media { width: 100%; height: 160px; }
        .cart-product-header { padding-right: 54px; }
        .cart-product-content h4 { white-space: normal; font-size: 22px; line-height: 1.05; }
      }
    </style>
  `
})
export class CartComponent implements AfterViewChecked {
   private cartService = inject(CartService);
   private productService = inject(ProductService);
   private authService = inject(AuthService);
   private http = inject(HttpClient);
   private fb = inject(FormBuilder);
   private route = inject(ActivatedRoute);
   private readonly CART_API = 'http://localhost:8080/api/cart';
   private readonly PAYMENT_API = 'http://localhost:8080/api/payments';
   private readonly SHIPPING_ADDRESS_API = 'http://localhost:8080/api/shipping-addresses';
   private readonly PROMO_LOCK_KEY = 'isgaarti_locked_promo';
   private readonly storedPromo = this.readStoredPromo();
   currentYear = new Date().getFullYear();

   currentStep = signal(1);
   isProcessing = signal(false);
   orderId = 'TRX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
   isFlipped = signal(false);
   completedOrderTotal = signal(0);
   completedItemCount = signal(0);
   completedOrder = signal<PaidOrder | null>(null);
   paymentFeedback = signal('');
   paymentFeedbackType = signal<'success' | 'error'>('success');
   embeddedCheckoutActive = signal(false);
   stripeCardReady = signal(false);
   stripeCardError = signal('');
   cardBrand = signal<'visa' | 'mastercard' | 'amex' | 'generic'>('generic');
   paymentAuthorizationText = signal('Initialisation du terminal sécurisé');
   appliedPromo = signal<number | null>(this.storedPromo?.rate ?? null);
   appliedPromoCode = signal<string | null>(this.storedPromo?.code ?? null);
   matchedPromoProductIds = signal<number[]>(this.storedPromo?.productIds ?? []);
   promoState = signal<'idle' | 'success' | 'error'>(this.storedPromo ? 'success' : 'idle');
   promoFeedback = signal(this.storedPromo ? 'Code promo restauré et verrouillé.' : '');
   isPromoLocked = computed(() => this.promoState() === 'success' && !!this.appliedPromoCode());
   shippingAddressMode = signal<'saved' | 'new'>('new');
   savedShippingAddresses = signal<ShippingAddress[]>([]);
   selectedShippingAddressId = signal<number | null>(null);
   selectedDialCode = signal('+212');
   isSavingShippingAddress = signal(false);
   shippingAddressFeedback = signal('');
   activeSwipeItemId = signal<number | null>(null);
   swipedItemId = signal<number | null>(null);
   swipeOffset = signal(0);
   private swipeStartX = 0;
   private swipeStartY = 0;
   private readonly swipeRevealWidth = 112;
   private stripeEmbeddedCheckout: any = null;
   private stripeInstance: any = null;
   private stripeElements: any = null;
   private stripeCardElement: any = null;

   cartItems = this.cartService.items;
   totalPrice = this.cartService.total;
   itemCount = computed(() => this.cartItems().reduce((total, item) => total + item.quantity, 0));
   promoMatchedItems = computed(() => {
      const code = this.appliedPromoCode();
      if (!code) return [];
      const matchedIds = new Set(this.matchedPromoProductIds());
      return this.cartItems().filter(item => matchedIds.has(item.id));
   });
   promoMatchedCount = computed(() => this.promoMatchedItems().reduce((total, item) => total + item.quantity, 0));
   promoDiscountAmount = computed(() => {
      const rate = this.appliedPromo();
      if (!rate) return 0;
      const eligibleSubtotal = this.promoMatchedItems().reduce((total, item) => total + (item.prix * item.quantity), 0);
      return eligibleSubtotal * (rate / 100);
   });
   discountedSubtotal = computed(() => Math.max(0, this.totalPrice() - this.promoDiscountAmount()));
   readonly freeShippingThreshold = 200;
   shippingCost = computed(() => this.discountedSubtotal() >= this.freeShippingThreshold ? 0 : 30);
   freeShippingRemaining = computed(() => Math.max(0, this.freeShippingThreshold - this.discountedSubtotal()));
   freeShippingProgress = computed(() => Math.min(100, (this.discountedSubtotal() / this.freeShippingThreshold) * 100));
   hasFreeShipping = computed(() => this.shippingCost() === 0);

   constructor() {
      effect(() => {
         const items = this.cartItems();
         const matchedIds = this.matchedPromoProductIds();
         if (!this.isPromoLocked()) return;

         const stillHasMatchedProduct = items.some(item => matchedIds.includes(item.id));
         if (!stillHasMatchedProduct) {
            this.clearPromoLock();
         }
      });

      this.loadShippingAddresses();
      this.resumeStripeReturn();
   }

   ngAfterViewChecked() {
      if (this.currentStep() === 3 && !this.stripeCardElement && !this.embeddedCheckoutActive()) {
         this.initializeStripeCardElement();
      }
   }

   steps = [
      { id: 1, label: 'PANIER', icon: 'list', isLast: false },
      { id: 2, label: 'LIVRAISON', icon: 'truck', isLast: false },
      { id: 3, label: 'PAIEMENT', icon: 'shield', isLast: false },
      { id: 4, label: 'CONFIRMÉ', icon: 'check-circle', isLast: true }
   ];

   countries = [
      { code: 'MA', name: 'Maroc', dial: '+212' },
      { code: 'FR', name: 'France', dial: '+33' },
      { code: 'ES', name: 'Espagne', dial: '+34' },
      { code: 'BE', name: 'Belgique', dial: '+32' },
      { code: 'DE', name: 'Allemagne', dial: '+49' },
      { code: 'IT', name: 'Italie', dial: '+39' },
      { code: 'NL', name: 'Pays-Bas', dial: '+31' },
      { code: 'GB', name: 'Royaume-Uni', dial: '+44' },
      { code: 'US', name: 'États-Unis', dial: '+1' },
      { code: 'CA', name: 'Canada', dial: '+1' },
      { code: 'AE', name: 'Émirats Arabes Unis', dial: '+971' },
      { code: 'SA', name: 'Arabie Saoudite', dial: '+966' },
      { code: 'TR', name: 'Turquie', dial: '+90' }
   ];

   infoForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['Maroc', Validators.required],
      phone: ['+212 ', [Validators.required, Validators.pattern(/^[+()\d\s.-]{7,20}$/)]],
      zipCode: ['00000', Validators.required]
   });

   cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^(\d{4} ){3}\d{3,4}$/)]],
      expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
   });

   totalFinalPrice = computed(() => {
      return this.discountedSubtotal() + this.shippingCost() + (this.discountedSubtotal() * 0.15);
   });

   isStepInvalid(): boolean {
      if (this.currentStep() === 2) return this.infoForm.invalid;
      if (this.currentStep() === 3) return !this.stripeCardReady();
      return false;
   }

   isPaymentCardReady(): boolean {
      const digits = this.cardDigits();
      const cvc = String(this.cardForm.get('cvc')?.value || '').replace(/\D/g, '');
      const cvcLength = this.cardBrand() === 'amex' ? 4 : 3;
      return (digits.length === 16 || digits.length === 15)
         && this.isExpiryReady()
         && cvc.length === cvcLength;
   }

   activeStepLabel(): string {
      return this.steps.find(step => step.id === this.currentStep())?.label || 'PANIER';
   }

   activeStepDescription(): string {
      switch (this.currentStep()) {
         case 1:
            return 'Vérification du panier, quantités et disponibilité des articles.';
         case 2:
            return 'Adresse de livraison et identité du destinataire en validation.';
         case 3:
            return 'Autorisation de paiement et contrôle sécurisé de la transaction.';
         default:
            return 'Commande confirmée et prête pour traitement.';
      }
   }

   nextStep() {
      this.currentStep.update(s => s + 1);
      if (this.currentStep() === 3) {
         setTimeout(() => this.initializeStripeCardElement(), 0);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
   }

   prevStep() {
      this.currentStep.update(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
   }

   updateQuantity(productId: number, quantity: number) {
      this.closeSwipe();
      this.cartService.updateQuantity(productId, quantity);
   }

   removeItem(productId: number) {
      this.closeSwipe();
      this.cartService.updateQuantity(productId, 0);
   }

   startSwipe(productId: number, event: PointerEvent) {
      const target = event.target as HTMLElement;
      if (target.closest('button, a, input, textarea, select')) return;

      this.activeSwipeItemId.set(productId);
      this.swipeStartX = event.clientX;
      this.swipeStartY = event.clientY;
      this.swipeOffset.set(this.swipedItemId() === productId ? -this.swipeRevealWidth : 0);
   }

   moveSwipe(productId: number, event: PointerEvent) {
      if (this.activeSwipeItemId() !== productId) return;

      const deltaX = event.clientX - this.swipeStartX;
      const deltaY = event.clientY - this.swipeStartY;
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 12) return;

      const baseOffset = this.swipedItemId() === productId ? -this.swipeRevealWidth : 0;
      const nextOffset = Math.max(-this.swipeRevealWidth, Math.min(0, baseOffset + deltaX));
      this.swipeOffset.set(nextOffset);
   }

   endSwipe(productId: number) {
      if (this.activeSwipeItemId() !== productId) return;

      const shouldOpen = this.swipeOffset() <= -(this.swipeRevealWidth * 0.45);
      this.swipedItemId.set(shouldOpen ? productId : null);
      this.swipeOffset.set(shouldOpen ? -this.swipeRevealWidth : 0);
      this.activeSwipeItemId.set(null);
   }

   cardSwipeTransform(productId: number): string {
      if (this.activeSwipeItemId() === productId || this.swipedItemId() === productId) {
         return `translateX(${this.swipeOffset()}px)`;
      }

      return 'translateX(0)';
   }

   isSwipeRevealing(productId: number): boolean {
      return this.activeSwipeItemId() === productId && this.swipeOffset() < -8;
   }

   deleteSwipedItem(productId: number, event: MouseEvent) {
      event.stopPropagation();
      this.removeItem(productId);
   }

   setShippingAddressMode(mode: 'saved' | 'new') {
      if (mode === 'saved' && this.savedShippingAddresses().length === 0) return;
      this.shippingAddressMode.set(mode);
      this.shippingAddressFeedback.set('');
      if (mode === 'new') {
         this.selectedShippingAddressId.set(null);
         this.infoForm.reset({
            fullName: '',
            email: '',
            city: '',
            country: 'Maroc',
            phone: '+212 ',
            address: '',
            zipCode: '00000'
         });
         this.selectedDialCode.set('+212');
      }
   }

   selectShippingAddress(address: ShippingAddress) {
      this.selectedShippingAddressId.set(address.id);
      this.shippingAddressMode.set('saved');
      this.infoForm.patchValue({
         fullName: address.fullName,
         email: address.email,
         city: address.city,
         country: address.country,
         phone: address.phone,
         address: address.address
      });
      this.selectedDialCode.set(this.getDialCodeForCountry(address.country));
      this.shippingAddressFeedback.set('Adresse enregistrée chargée pour cette commande.');
   }

   onCountryChanged() {
      const country = this.infoForm.value.country || 'Maroc';
      const dialCode = this.getDialCodeForCountry(country);
      this.selectedDialCode.set(dialCode);
      this.infoForm.patchValue({ phone: this.replaceDialCode(this.infoForm.value.phone || '', dialCode) });
   }

   saveShippingAddress() {
      if (!this.canUseDatabaseCart()) {
         this.shippingAddressFeedback.set('Connectez-vous comme client pour sauvegarder cette adresse.');
         return;
      }

      if (this.infoForm.invalid) {
         this.infoForm.markAllAsTouched();
         this.shippingAddressFeedback.set('Complétez les coordonnées avant sauvegarde.');
         return;
      }

      const payload = {
         fullName: this.infoForm.value.fullName,
         email: this.infoForm.value.email,
         city: this.infoForm.value.city,
         country: this.infoForm.value.country,
         phone: this.infoForm.value.phone,
         address: this.infoForm.value.address
      };

      this.isSavingShippingAddress.set(true);
      this.http.post<ShippingAddress>(this.SHIPPING_ADDRESS_API, payload).subscribe({
         next: address => {
            this.savedShippingAddresses.update(addresses => [address, ...addresses]);
            this.selectShippingAddress(address);
            this.shippingAddressFeedback.set('Adresse sauvegardée et prête pour les prochains achats.');
            this.isSavingShippingAddress.set(false);
         },
         error: () => {
            this.shippingAddressFeedback.set('Sauvegarde impossible pour le moment.');
            this.isSavingShippingAddress.set(false);
         }
      });
   }

   private loadShippingAddresses() {
      if (!this.canUseDatabaseCart()) return;

      this.http.get<ShippingAddress[]>(this.SHIPPING_ADDRESS_API).subscribe({
         next: addresses => {
            this.savedShippingAddresses.set(addresses);
            if (addresses.length > 0) {
               this.selectShippingAddress(addresses[0]);
            }
         },
         error: () => {
            this.savedShippingAddresses.set([]);
            this.shippingAddressMode.set('new');
         }
      });
   }

   private getDialCodeForCountry(countryName: string): string {
      return this.countries.find(country => country.name === countryName)?.dial || '+212';
   }

   private replaceDialCode(currentPhone: string, dialCode: string): string {
      const localNumber = currentPhone
         .replace(/^\+\d{1,4}/, '')
         .replace(/^[\s().-]+/, '')
         .trim();

      return localNumber ? `${dialCode} ${localNumber}` : `${dialCode} `;
   }

   private closeSwipe() {
      this.activeSwipeItemId.set(null);
      this.swipedItemId.set(null);
      this.swipeOffset.set(0);
   }

   applyPromoCode(code: string) {
      if (this.isPromoLocked()) {
         this.promoFeedback.set('Code promo déjà verrouillé pour cette commande.');
         return;
      }

      const normalizedCode = this.normalizePromoCode(code);
      if (!normalizedCode) {
         this.rejectPromo('Entrez un code promotionnel.');
         return;
      }

      const matchingItems = this.findMatchingCartItems(normalizedCode);
      const promoRate = matchingItems.find(item => Number(item.promo) > 0)?.promo;

      if (matchingItems.length && promoRate) {
         this.acceptPromo(normalizedCode, Number(promoRate), matchingItems.map(item => item.id));
         return;
      }

      if (this.canUseDatabaseCart()) {
         this.applyPromoCodeFromDatabase(normalizedCode);
      } else {
         this.refreshPromoDataAndApply(normalizedCode);
      }
   }

   resetPromoFeedback() {
      if (this.isPromoLocked()) return;
      if (this.promoState() === 'error') {
         this.promoState.set('idle');
         this.promoFeedback.set('');
      }
   }

   private rejectPromo(message: string) {
      this.appliedPromo.set(null);
      this.appliedPromoCode.set(null);
      this.matchedPromoProductIds.set([]);
      localStorage.removeItem(this.PROMO_LOCK_KEY);
      this.promoState.set('error');
      this.promoFeedback.set(message);
   }

   private acceptPromo(code: string, rate: number, productIds: number[]) {
      this.appliedPromo.set(rate);
      this.appliedPromoCode.set(code);
      this.matchedPromoProductIds.set(productIds);
      this.persistLockedPromo(code, rate, productIds);
      this.promoState.set('success');
      this.promoFeedback.set(`${code} synchronisé avec ${productIds.length} produit(s).`);
   }

   private refreshPromoDataAndApply(code: string) {
      const items = this.cartItems();
      if (!items.length) {
         this.rejectPromo('Votre panier est vide.');
         return;
      }

      this.promoState.set('idle');
      this.promoFeedback.set('Synchronisation du code avec les produits...');

      forkJoin(items.map(item => this.productService.getProduct(item.id))).subscribe({
         next: products => {
            const matchingProducts = products.filter(product => this.productMatchesCode(product, code));
            const promoRate = matchingProducts.find(product => Number(product.promo) > 0)?.promo;

            if (!matchingProducts.length || !promoRate) {
               this.rejectPromo('Code non applicable aux produits du panier.');
               return;
            }

            this.acceptPromo(code, Number(promoRate), matchingProducts.map(product => product.id));
         },
         error: () => this.rejectPromo('Synchronisation promo impossible.')
      });
   }

   private applyPromoCodeFromDatabase(code: string) {
      this.promoState.set('idle');
      this.promoFeedback.set('Vérification du code dans le panier...');

      this.http.post<any>(`${this.CART_API}/promo/apply`, { code }).subscribe({
         next: response => {
            if (!response?.applied) {
               this.rejectPromo(response?.message || 'Code promo non applicable aux produits du panier.');
               return;
            }

            this.acceptPromo(
               this.normalizePromoCode(response.code || code),
               Number(response.percentage),
               Array.isArray(response.productIds) ? response.productIds : []
            );
            this.promoFeedback.set(response.message || `${code} appliqué au panier.`);
         },
         error: () => this.refreshPromoDataAndApply(code)
      });
   }

   private canUseDatabaseCart(): boolean {
      return this.authService.isAuthenticated() && this.authService.hasRole('ROLE_CLIENT');
   }

   private findMatchingCartItems(code: string) {
      return this.cartItems().filter(item => this.productMatchesCode(item, code));
   }

   private productMatchesCode(product: Produit, code: string): boolean {
      return this.normalizePromoCode(product.promoCode) === code && Number(product.promo) > 0;
   }

   private normalizePromoCode(code?: string | null): string {
      return (code || '').trim().toUpperCase();
   }

   private persistLockedPromo(code: string, rate: number, productIds: number[]) {
      localStorage.setItem(this.PROMO_LOCK_KEY, JSON.stringify({ code, rate, productIds }));
   }

   private clearPromoLock() {
      this.appliedPromo.set(null);
      this.appliedPromoCode.set(null);
      this.matchedPromoProductIds.set([]);
      this.promoState.set('idle');
      this.promoFeedback.set('');
      localStorage.removeItem(this.PROMO_LOCK_KEY);
   }

   private readStoredPromo(): { code: string; rate: number; productIds: number[] } | null {
      try {
         const raw = localStorage.getItem(this.PROMO_LOCK_KEY);
         if (!raw) return null;
         const parsed = JSON.parse(raw);
         if (!parsed?.code || !parsed?.rate || !Array.isArray(parsed.productIds)) return null;
         return {
            code: this.normalizePromoCode(parsed.code),
            rate: Number(parsed.rate),
            productIds: parsed.productIds.map((id: unknown) => Number(id)).filter((id: number) => Number.isFinite(id))
         };
      } catch {
         localStorage.removeItem(this.PROMO_LOCK_KEY);
         return null;
      }
   }

   processPayment() {
      this.isProcessing.set(true);
      this.paymentFeedback.set('Autorisation Stripe en cours...');
      this.paymentFeedbackType.set('success');

      const checkoutPayload = {
         fullName: this.infoForm.value.fullName,
         email: this.infoForm.value.email,
         address: this.infoForm.value.address,
         city: this.infoForm.value.city,
         country: this.infoForm.value.country,
         phone: this.infoForm.value.phone,
         promoCode: this.appliedPromoCode()
      };

      this.http.post<{ clientSecret: string; publishableKey: string; paymentIntentId: string; orderNumber: string }>(`${this.PAYMENT_API}/stripe/payment-intent`, checkoutPayload).subscribe({
         next: response => this.confirmStripeCardPayment(response),
         error: error => this.rejectPayment(error?.error?.message || 'Stripe Checkout intégré indisponible.')
      });
   }

   private async initializeStripeCardElement() {
      const mount = document.getElementById('stripe-card-element');
      if (!mount || this.stripeCardElement) return;

      try {
         const config = await this.http.get<{ publishableKey: string }>(`${this.PAYMENT_API}/stripe/config`).toPromise();
         if (!config?.publishableKey) {
            this.stripeCardError.set('Clé publique Stripe manquante.');
            return;
         }

         await this.loadStripeJs();
         this.stripeInstance = (window as any).Stripe(config.publishableKey);
         this.stripeElements = this.stripeInstance.elements({
            locale: 'fr'
         });
         this.stripeCardElement = this.stripeElements.create('card', {
            hidePostalCode: true,
            style: {
               base: {
                  color: '#ffffff',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '15px',
                  fontWeight: '800',
                  iconColor: '#fbbf24',
                  '::placeholder': { color: 'rgba(255,255,255,0.22)' }
               },
               invalid: { color: '#ef4444', iconColor: '#ef4444' }
            }
         });
         this.stripeCardElement.mount('#stripe-card-element');
         this.stripeCardElement.on('change', (event: any) => {
            this.stripeCardReady.set(!!event.complete);
            this.stripeCardError.set(event.error?.message || '');
            if (event.brand) {
               this.cardBrand.set(this.normalizeStripeBrand(event.brand));
            }
         });
      } catch {
         this.stripeCardError.set('Stripe Elements ne peut pas charger.');
      }
   }

   private async confirmStripeCardPayment(response: { clientSecret: string; publishableKey: string; paymentIntentId: string; orderNumber: string }) {
      try {
         if (!this.stripeInstance || !this.stripeCardElement) {
            await this.initializeStripeCardElement();
         }
         if (!this.stripeInstance || !this.stripeCardElement) {
            this.rejectPayment('Carte Stripe non prête.');
            return;
         }

         this.orderId = response.orderNumber || this.orderId;
         this.paymentAuthorizationText.set('Validation bancaire Stripe');
         const result = await this.stripeInstance.confirmCardPayment(response.clientSecret, {
            payment_method: {
               card: this.stripeCardElement,
               billing_details: {
                  name: this.infoForm.value.fullName || 'Client ISGAARTI',
                  email: this.infoForm.value.email || undefined,
                  phone: this.infoForm.value.phone || undefined,
                  address: {
                     line1: this.infoForm.value.address || undefined,
                     city: this.infoForm.value.city || undefined,
                     country: 'MA'
                  }
               }
            }
         });

         if (result.error) {
            this.rejectPayment(result.error.message || 'Paiement refusé par Stripe.');
            return;
         }

         this.paymentAuthorizationText.set('Paiement accepté par Stripe');
         this.http.get<PaidOrder>(`${this.PAYMENT_API}/stripe/payment-intent/${response.paymentIntentId}`).subscribe({
            next: order => this.completePaidOrder(order),
            error: error => this.rejectPayment(error?.error?.message || 'Paiement confirmé mais synchronisation commande impossible.')
         });
      } catch {
         this.rejectPayment('Confirmation Stripe impossible.');
      }
   }

   private completePaidOrder(order: PaidOrder) {
      this.completedOrder.set(order);
      this.orderId = order.orderNumber;
      this.completedOrderTotal.set(Number(order.total || 0));
      this.completedItemCount.set((order.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0));
      this.isProcessing.set(false);
      this.paymentFeedback.set('Paiement Stripe confirmé. Facture prête.');
      this.paymentFeedbackType.set('success');
      this.cartService.clearCart();
      this.clearPromoLock();
      this.currentStep.set(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
   }

   private async mountEmbeddedStripeCheckout(response: { clientSecret: string; publishableKey: string; sessionId: string; orderNumber: string }) {
      try {
         if (!response?.clientSecret || !response?.publishableKey) {
            this.rejectPayment('Stripe Checkout ne peut pas démarrer: clé publique ou client secret manquant.');
            return;
         }

         this.orderId = response.orderNumber || this.orderId;
         this.embeddedCheckoutActive.set(true);
         this.paymentFeedback.set('Checkout Stripe chargé dans votre page.');
         this.paymentFeedbackType.set('success');

         await this.loadStripeJs();
         setTimeout(async () => {
            const stripe = (window as any).Stripe(response.publishableKey);
            this.stripeEmbeddedCheckout = await stripe.initEmbeddedCheckout({
               clientSecret: response.clientSecret
            });
            this.stripeEmbeddedCheckout.mount('#stripe-embedded-checkout');
            this.isProcessing.set(false);
         }, 0);
      } catch (error) {
         this.rejectPayment('Impossible de monter Stripe Checkout dans la page.');
      }
   }

   private loadStripeJs(): Promise<void> {
      return new Promise((resolve, reject) => {
         if ((window as any).Stripe) {
            resolve();
            return;
         }

         const script = document.createElement('script');
         script.src = 'https://js.stripe.com/clover/stripe.js';
         script.async = true;
         script.onload = () => resolve();
         script.onerror = () => reject();
         document.head.appendChild(script);
      });
   }

   downloadInvoicePdf() {
      const order = this.completedOrder() || this.buildLocalInvoiceOrder();
      const pdf = this.createInvoicePdf(order);
      const blob = new Blob([pdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${order.orderNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
   }

   private resumeStripeReturn() {
      const sessionId = this.route.snapshot.queryParamMap.get('stripe_session_id');
      const cancelled = this.route.snapshot.queryParamMap.get('payment') === 'cancelled';

      if (cancelled) {
         this.rejectPayment('Paiement annulé. Votre panier reste disponible.');
         return;
      }

      if (!sessionId) return;

      this.isProcessing.set(true);
      this.currentStep.set(3);
      this.paymentFeedback.set('Paiement reçu. Vérification Stripe en cours...');
      this.paymentFeedbackType.set('success');

      this.http.get<PaidOrder>(`${this.PAYMENT_API}/stripe/session/${sessionId}`).subscribe({
         next: order => {
            if (order.paymentStatus !== 'PAID') {
               this.rejectPayment('Paiement non confirmé par Stripe.');
               return;
            }

            this.completedOrder.set(order);
            this.orderId = order.orderNumber;
            this.completedOrderTotal.set(Number(order.total || 0));
            this.completedItemCount.set((order.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0));
            this.isProcessing.set(false);
            this.paymentFeedback.set('Paiement Stripe confirmé. Facture prête.');
            this.paymentFeedbackType.set('success');
            this.cartService.clearCart();
            this.clearPromoLock();
            this.currentStep.set(4);
            window.scrollTo({ top: 0, behavior: 'smooth' });
         },
         error: error => this.rejectPayment(error?.error?.message || 'Validation Stripe impossible.')
      });
   }

   private rejectPayment(message: string) {
      this.isProcessing.set(false);
      this.paymentFeedback.set(message);
      this.paymentFeedbackType.set('error');
   }

   private buildLocalInvoiceOrder(): PaidOrder {
      return {
         orderNumber: this.orderId,
         status: 'PAYEE',
         paymentStatus: 'PAID',
         total: this.completedOrderTotal() || this.totalFinalPrice(),
         subtotal: this.totalPrice(),
         shippingCost: this.shippingCost(),
         taxAmount: this.discountedSubtotal() * 0.15,
         promoDiscount: this.promoDiscountAmount(),
         promoCode: this.appliedPromoCode() || undefined,
         clientName: this.infoForm.value.fullName || 'Client ISGAARTI',
         clientEmail: this.infoForm.value.email || '',
         shippingPhone: this.infoForm.value.phone || '',
         shippingAddress: this.infoForm.value.address || '',
         shippingCity: this.infoForm.value.city || '',
         shippingCountry: this.infoForm.value.country || '',
         items: this.cartItems().map(item => ({
            name: item.nom,
            quantity: item.quantity,
            unitPrice: item.prix,
            image: item.image
         }))
      };
   }

   private createInvoicePdf(order: PaidOrder): ArrayBuffer {
      const pageWidth = 595;
      const pageHeight = 842;
      const commands: string[] = [];
      const text = (value: string, x: number, y: number, size = 10) => {
         commands.push(`BT /F1 ${size} Tf ${x} ${y} Td (${this.pdfEscape(value)}) Tj ET`);
      };
      const fill = (r: number, g: number, b: number) => commands.push(`${r} ${g} ${b} rg`);
      const rect = (x: number, y: number, w: number, h: number) => commands.push(`${x} ${y} ${w} ${h} re f`);
      const line = (x1: number, y1: number, x2: number, y2: number) => commands.push(`${x1} ${y1} m ${x2} ${y2} l S`);
      const stroke = (r: number, g: number, b: number) => commands.push(`${r} ${g} ${b} RG`);
      const outline = (x: number, y: number, w: number, h: number) => commands.push(`${x} ${y} ${w} ${h} re S`);
      const metric = (label: string, value: string, x: number, y: number, w: number) => {
         fill(0.09, 0.09, 0.105); rect(x, y, w, 54);
         stroke(0.2, 0.2, 0.22); outline(x, y, w, 54);
         fill(0.56, 0.56, 0.62); text(label, x + 12, y + 34, 7);
         fill(1, 1, 1); text(value, x + 12, y + 15, 13);
      };
      const infoLine = (label: string, value: string, x: number, y: number) => {
         fill(0.48, 0.48, 0.54); text(label, x, y, 7);
         fill(1, 1, 1); text(value || '-', x, y - 14, 9);
      };

      fill(0.04, 0.04, 0.05); rect(0, 0, pageWidth, pageHeight);
      fill(0.075, 0.075, 0.09); rect(28, 28, 539, 786);
      stroke(0.18, 0.18, 0.21); outline(28, 28, 539, 786);

      fill(0.98, 0.75, 0.14); rect(42, 785, 120, 5);
      rect(42, 770, 28, 5);
      fill(1, 1, 1); text('ISGAARTI STORE', 42, 744, 24);
      fill(0.98, 0.75, 0.14); text('FACTURE E-COMMERCE CERTIFIEE', 42, 722, 8);
      fill(0.55, 0.55, 0.6); text('Marketplace Operations / Secure Retail Network', 42, 707, 8);

      fill(0.98, 0.75, 0.14); rect(375, 724, 154, 42);
      fill(0.03, 0.03, 0.035); text('TOTAL PAYE', 390, 747, 8);
      text(`${this.money(order.total)} MAD`, 390, 731, 16);
      fill(0.55, 0.55, 0.6); text(`Facture: ${order.orderNumber}`, 375, 704, 9);
      text(`Emission: ${new Date().toLocaleDateString('fr-FR')}`, 375, 689, 9);
      fill(0.16, 0.16, 0.18); rect(375, 674, 154, 1);
      fill(0.98, 0.75, 0.14); text('PAIEMENT AUTORISE', 375, 657, 9);

      metric('REFERENCE', order.orderNumber, 42, 620, 118);
      metric('STATUT', order.paymentStatus || order.status || 'PAID', 172, 620, 100);
      metric('CANAL', 'ISGAARTI PAY', 284, 620, 116);
      metric('ETA', '24-48H', 412, 620, 117);

      fill(0.98, 0.75, 0.14); text('IDENTITE CLIENT', 42, 585, 9);
      fill(0.98, 0.75, 0.14); text('RESEAU DE LIVRAISON', 315, 585, 9);
      fill(0.1, 0.1, 0.12); rect(42, 500, 240, 72);
      rect(315, 500, 214, 72);
      stroke(0.2, 0.2, 0.22); outline(42, 500, 240, 72); outline(315, 500, 214, 72);
      infoLine('NOM CLIENT', order.clientName || 'Client ISGAARTI', 58, 550);
      infoLine('EMAIL', order.clientEmail || 'Compte client', 58, 522);
      infoLine('ADRESSE', order.shippingAddress || 'Adresse client', 331, 550);
      infoLine('VILLE / PAYS', `${order.shippingCity || '-'} / ${order.shippingCountry || '-'}`, 331, 522);
      fill(0.48, 0.48, 0.54); text('TELEPHONE', 455, 550, 7);
      fill(1, 1, 1); text(order.shippingPhone || '-', 455, 536, 8);

      fill(0.98, 0.75, 0.14); text('MANIFESTE ARTICLES', 42, 468, 9);
      fill(0.18, 0.18, 0.205); rect(42, 443, 487, 24);
      fill(1, 1, 1); text('Produit', 58, 451, 8); text('Qté', 338, 451, 8); text('Prix', 392, 451, 8); text('Total', 474, 451, 8);

      let y = 415;
      order.items.slice(0, 7).forEach((item, index) => {
         const itemTotal = Number(item.unitPrice || 0) * Number(item.quantity || 0);
         fill(index % 2 === 0 ? 0.105 : 0.085, index % 2 === 0 ? 0.105 : 0.085, index % 2 === 0 ? 0.125 : 0.105);
         rect(42, y - 8, 487, 30);
         fill(1, 1, 1); text(item.name || 'Produit', 58, y + 4, 9);
         fill(0.48, 0.48, 0.54); text(`SKU-${index + 1} / Secure item`, 58, y - 8, 7);
         fill(0.72, 0.72, 0.76); text(String(item.quantity || 0), 342, y, 9);
         text(`${this.money(item.unitPrice)} MAD`, 392, y, 8);
         fill(0.98, 0.75, 0.14); text(`${this.money(itemTotal)} MAD`, 474, y, 8);
         y -= 34;
      });
      if (order.items.length > 7) {
         fill(0.55, 0.55, 0.6); text(`+ ${order.items.length - 7} autres articles dans la commande`, 58, y, 8);
      }

      fill(0.1, 0.1, 0.12); rect(42, 82, 220, 128);
      stroke(0.2, 0.2, 0.22); outline(42, 82, 220, 128);
      fill(0.98, 0.75, 0.14); text('GARANTIES COMMANDE', 58, 188, 8);
      fill(1, 1, 1); text('Paiement simule et autorise', 58, 166, 9);
      fill(0.62, 0.62, 0.68); text('Facture generee automatiquement par ISGAARTI Store.', 58, 148, 7);
      text('Support: support@isgaarti.store', 58, 130, 7);
      text('Canal: Secure checkout / Client account', 58, 112, 7);
      text(`Reference paiement: ${order.orderNumber}`, 58, 94, 7);

      fill(0.1, 0.1, 0.12); rect(305, 82, 224, 158);
      stroke(0.24, 0.24, 0.27); outline(305, 82, 224, 158);
      fill(0.98, 0.75, 0.14); text('SYNTHESE FINANCIERE', 323, 216, 8);
      fill(0.72, 0.72, 0.76); text('Sous-total articles', 323, 190, 9); text(`${this.money(order.subtotal)} MAD`, 452, 190, 9);
      text('Livraison', 323, 170, 9); text(order.shippingCost > 0 ? `${this.money(order.shippingCost)} MAD` : 'GRATUIT', 452, 170, 9);
      text('Taxes 15%', 323, 150, 9); text(`${this.money(order.taxAmount)} MAD`, 452, 150, 9);
      if (order.promoDiscount > 0) {
         text(`Promo ${order.promoCode || ''}`, 323, 130, 9);
         fill(0.28, 0.88, 0.42); text(`-${this.money(order.promoDiscount)} MAD`, 452, 130, 9);
      }
      fill(0.98, 0.75, 0.14); rect(323, 94, 188, 28);
      fill(0.02, 0.02, 0.025); text('TOTAL FINAL', 338, 103, 9); text(`${this.money(order.total)} MAD`, 430, 103, 12);

      fill(0.98, 0.75, 0.14); rect(42, 52, 487, 3);
      fill(0.55, 0.55, 0.6); text('ISGAARTI Store remercie votre confiance. Conservez cette facture pour votre suivi de commande.', 42, 36, 8);
      fill(0.28, 0.28, 0.32); text('Document genere par ISGAARTI Secure Console. Les montants sont exprimes en MAD.', 42, 22, 7);

      return this.buildPdf(commands.join('\n'), pageWidth, pageHeight);
   }

   private buildPdf(content: string, pageWidth: number, pageHeight: number): ArrayBuffer {
      const objects = [
         '<< /Type /Catalog /Pages 2 0 R >>',
         '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
         `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
         '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
         `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
      ];
      let pdf = '%PDF-1.4\n';
      const offsets = [0];
      objects.forEach((object, index) => {
         offsets.push(pdf.length);
         pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
      });
      const xrefOffset = pdf.length;
      pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
      offsets.slice(1).forEach(offset => pdf += `${String(offset).padStart(10, '0')} 00000 n \n`);
      pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
      const encoded = new TextEncoder().encode(pdf);
      return encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength) as ArrayBuffer;
   }

   private pdfEscape(value: string): string {
      return this.stripAccents(String(value || '')).replace(/[\\()]/g, '\\$&').slice(0, 86);
   }

   private stripAccents(value: string): string {
      return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
   }

   private money(value: number): string {
      return Number(value || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 });
   }

   formatCardNumber(event: any) {
      let value = event.target.value.replace(/\D/g, '');
      let formatted = '';
      for (let i = 0; i < value.length; i++) {
         if (i > 0 && i % 4 === 0) formatted += ' ';
         formatted += value[i];
      }
      this.cardForm.get('cardNumber')?.setValue(formatted, { emitEvent: false });
      this.cardBrand.set(this.detectCardBrand(value));
   }

   formatCvc(event: any) {
      const maxLength = this.cardBrand() === 'amex' ? 4 : 3;
      const value = event.target.value.replace(/\D/g, '').slice(0, maxLength);
      this.cardForm.get('cvc')?.setValue(value, { emitEvent: false });
   }

   cardBrandLabel(): string {
      switch (this.cardBrand()) {
         case 'visa':
            return 'Visa';
         case 'mastercard':
            return 'Mastercard';
         case 'amex':
            return 'American Express';
         default:
            return 'Carte bancaire';
      }
   }

   cardBrandCode(): string {
      switch (this.cardBrand()) {
         case 'visa':
            return 'VISA';
         case 'mastercard':
            return 'MC';
         case 'amex':
            return 'AMEX';
         default:
            return 'CARD';
      }
   }

   private detectCardBrand(digits: string): 'visa' | 'mastercard' | 'amex' | 'generic' {
      if (/^4/.test(digits)) return 'visa';
      if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
      if (/^3[47]/.test(digits)) return 'amex';
      return 'generic';
   }

   private normalizeStripeBrand(brand: string): 'visa' | 'mastercard' | 'amex' | 'generic' {
      if (brand === 'visa') return 'visa';
      if (brand === 'mastercard') return 'mastercard';
      if (brand === 'amex') return 'amex';
      return 'generic';
   }

   private cardDigits(): string {
      return String(this.cardForm.get('cardNumber')?.value || '').replace(/\D/g, '');
   }

   private isExpiryReady(): boolean {
      const expiry = String(this.cardForm.get('expiry')?.value || '');
      const match = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
      if (!match) return false;

      const month = Number(match[1]);
      const year = 2000 + Number(match[2]);
      const now = new Date();
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);
      return endOfMonth >= now;
   }

   formatExpiry(event: any) {
      let value = event.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
         value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      this.cardForm.get('expiry')?.setValue(value, { emitEvent: false });
   }
}
