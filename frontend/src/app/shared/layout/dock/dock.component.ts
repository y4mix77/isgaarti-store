import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-dock',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <nav class="flex items-center space-x-2 px-4 py-3 bg-zinc-900/60 backdrop-blur-2xl border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-2xl">
        
        <!-- 1. Home -->
        <a routerLink="/" [routerLinkActiveOptions]="{exact: true}" routerLinkActive="active-dock-icon" class="dock-icon group relative">
          <lucide-icon name="home" class="w-6 h-6 text-zinc-400 group-hover:text-zinc-100 transition-colors"></lucide-icon>
          <span class="dock-tooltip">Home</span>
        </a>

        <div class="w-px h-8 bg-white/10 mx-1"></div> <!-- Divider -->

        <!-- 2. Products -->
        <a routerLink="/produits" routerLinkActive="active-dock-icon" class="dock-icon group relative">
          <lucide-icon name="package" class="w-6 h-6 text-zinc-400 group-hover:text-zinc-100 transition-colors"></lucide-icon>
          <span class="dock-tooltip">Catalog</span>
        </a>

        <!-- 3. Panier -->
        <a routerLink="/panier" routerLinkActive="active-dock-icon" class="dock-icon group relative" id="global-cart-anchor">
          <lucide-icon name="shopping-cart" class="w-6 h-6 text-zinc-400 group-hover:text-zinc-100 transition-colors"></lucide-icon>
          @if (cartCount() > 0) {
            <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-[10px] font-bold text-black shadow-md">
              {{ cartCount() > 99 ? '99+' : cartCount() }}
            </span>
          }
          <span class="dock-tooltip">Panier</span>
        </a>

        <!-- 4. Profile Dropup -->
        <div class="relative group" (mouseenter)="isProfileOpen.set(true)" (mouseleave)="isProfileOpen.set(false)">
          <button class="dock-icon relative outline-none focus:outline-none" [class.active-dock-icon]="isProfileOpen()">
            <lucide-icon name="user-circle" class="w-6 h-6 text-zinc-400 group-hover:text-zinc-100 transition-colors"></lucide-icon>
          </button>
          
          <!-- Dropup Menu Wrapper (with pb-4 to bridge the gap so it doesn't disappear on hover) -->
          @if (isProfileOpen()) {
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 w-64 pb-4 z-50">
              <div class="bg-zinc-900/90 backdrop-blur-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-2xl overflow-hidden py-1.5 animate-in slide-in-from-bottom-2 fade-in duration-200">
                
                <!-- Premium Header -->
                <div class="px-4 py-3 border-b border-white/5 bg-white/5">
                  <p class="text-sm font-bold text-white truncate flex items-center">
                    {{ user()?.email || 'User' }}
                    <span class="ml-2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                  </p>
                  <p class="text-xs text-zinc-400 font-medium tracking-wide mt-0.5 uppercase">
                    {{ isVendeur() ? 'Vendeur Node' : isAdmin() ? 'Admin Node' : 'Client Session' }}
                  </p>
                </div>
                
                <div class="p-1.5">
                  @if (isClient() || (!isVendeur() && !isAdmin())) {
                    <a routerLink="/commandes" class="flex items-center px-3 py-2 text-sm text-zinc-200 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200 group/item">
                      <div class="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center mr-3 border border-white/5 group-hover/item:border-white/20 transition-colors">
                        <lucide-icon name="package" class="w-4 h-4"></lucide-icon>
                      </div>
                      <span class="font-medium">Mes Commandes</span>
                    </a>
                  }
                  
                  @if (isVendeur()) {
                    <a routerLink="/vendeur" class="flex items-center px-3 py-2 text-sm text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all duration-200 group/item">
                      <div class="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center mr-3 border border-amber-500/20 group-hover/item:border-amber-500/40 transition-colors">
                        <lucide-icon name="shield" class="w-4 h-4"></lucide-icon>
                      </div>
                      <span class="font-medium">Control Panel</span>
                    </a>
                    <a routerLink="/vendeur/commandes" class="flex items-center px-3 py-2 text-sm text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all duration-200 group/item">
                      <div class="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center mr-3 border border-amber-500/20 group-hover/item:border-amber-500/40 transition-colors">
                        <lucide-icon name="truck" class="w-4 h-4"></lucide-icon>
                      </div>
                      <span class="font-medium">Commandes</span>
                    </a>
                  }
                </div>
                
                <div class="px-1.5 pb-1.5 pt-1 border-t border-white/5">
                  <button (click)="logout()" class="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-left group/item">
                    <div class="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center mr-3 border border-red-500/20 group-hover/item:border-red-500/40 transition-colors">
                      <lucide-icon name="log-out" class="w-4 h-4"></lucide-icon>
                    </div>
                    <span class="font-medium">Sign Out</span>
                  </button>
                </div>

              </div>
            </div>
          }
        </div>

        <!-- 5. Admin -->
        @if (isAdmin()) {
          <div class="w-px h-8 bg-white/10 mx-1"></div> <!-- Divider -->
          <a routerLink="/admin" routerLinkActive="active-dock-icon" class="dock-icon group relative">
            <lucide-icon name="shield" class="w-6 h-6 text-red-400 group-hover:text-red-300 transition-colors"></lucide-icon>
            <span class="dock-tooltip">Admin</span>
          </a>
        }
      </nav>
    </div>
  `,
  styles: [`
    .dock-icon {
      @apply p-3 rounded-xl transition-all duration-300 ease-out flex items-center justify-center cursor-pointer hover:bg-white/5 hover:-translate-y-1 hover:scale-110 active:scale-95;
    }
    .active-dock-icon lucide-icon {
      @apply text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)];
    }
    .dock-tooltip {
      @apply absolute bottom-full mb-3 px-2 py-1 bg-black/80 backdrop-blur-md text-zinc-200 text-xs rounded-md opacity-0 scale-95 pointer-events-none transition-all duration-200 ease-out border border-white/10 whitespace-nowrap;
    }
    .dock-icon:hover .dock-tooltip {
      @apply opacity-100 scale-100;
    }
    .pulse-pop {
      animation: pulse-pop 0.4s cubic-bezier(0.17, 0.89, 0.32, 1.49);
    }
    @keyframes pulse-pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.3); filter: brightness(1.5) drop-shadow(0 0 10px #fbbf24); }
      100% { transform: scale(1); }
    }
  `]
})
export class DockComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  user = this.authService.currentUser;
  cartCount = this.cartService.count;
  
  isProfileOpen = signal(false);

  isAdmin() {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  isVendeur() {
    return this.authService.hasRole('ROLE_VENDEUR');
  }

  isClient() {
    // Actually standard clients might have ROLE_CLIENT, or just don't have ADMIN/VENDEUR
    return this.authService.hasRole('ROLE_CLIENT');
  }

  logout() {
    this.authService.logout();
  }
}
