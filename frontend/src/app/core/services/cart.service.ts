import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Produit } from './product.service';
import { AuthService } from './auth.service';

export interface CartItem extends Produit {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API_URL = 'http://localhost:8080/api/cart';
  private readonly GUEST_STORAGE_KEY = 'isgaarti_cart_guest';
  private readonly LEGACY_STORAGE_KEY = 'isgaarti_cart';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private cartItems = signal<CartItem[]>(this.readLocalCart());
  private activeUserKey: string | null = null;

  public readonly items = computed(() => this.cartItems());
  
  public readonly count = computed(() => 
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0)
  );

  public readonly total = computed(() => 
    this.cartItems().reduce((acc, item) => acc + (item.prix * item.quantity), 0)
  );

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      const userKey = this.getUserKey(user);

      if (userKey !== this.activeUserKey) {
        this.activeUserKey = userKey;
        this.cartItems.set([]);

        if (user && this.isDatabaseCartEnabled()) {
          localStorage.removeItem(this.LEGACY_STORAGE_KEY);
          this.loadServerCart();
          return;
        }

        this.cartItems.set(this.readLocalCart());
      }
    });
  }

  addToCart(product: Produit) {
    this.updateLocalItems(items => {
      const existingItem = items.find(i => i.id === product.id);
      if (existingItem) {
        return items.map(i => i.id === product.id 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
        );
      }
      return [...items, { ...product, quantity: 1 }];
    });

    if (this.isDatabaseCartEnabled()) {
      this.http.post<CartItem[]>(`${this.API_URL}/items`, { productId: product.id, quantity: 1 })
        .subscribe({
          next: items => this.setServerItems(items),
          error: () => this.persistLocalCart()
        });
    }
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this.updateLocalItems(items => 
      items.map(i => i.id === productId ? { ...i, quantity } : i)
    );

    if (this.isDatabaseCartEnabled()) {
      this.http.put<CartItem[]>(`${this.API_URL}/items/${productId}`, { quantity })
        .subscribe({
          next: items => this.setServerItems(items),
          error: () => this.persistLocalCart()
        });
    }
  }

  removeFromCart(productId: number) {
    this.updateLocalItems(items => items.filter(i => i.id !== productId));

    if (this.isDatabaseCartEnabled()) {
      this.http.delete<CartItem[]>(`${this.API_URL}/items/${productId}`)
        .subscribe({
          next: items => this.setServerItems(items),
          error: () => this.persistLocalCart()
        });
    }
  }

  clearCart() {
    this.cartItems.set([]);
    this.persistLocalCart();

    if (this.isDatabaseCartEnabled()) {
      this.http.delete<CartItem[]>(this.API_URL)
        .subscribe({
          next: items => this.setServerItems(items),
          error: () => this.persistLocalCart()
        });
    }
  }

  private loadServerCart() {
    this.http.get<CartItem[]>(this.API_URL).subscribe({
      next: items => this.setServerItems(items),
      error: () => this.cartItems.set(this.readLocalCart())
    });
  }

  private setServerItems(items: CartItem[]) {
    this.cartItems.set(items || []);
    localStorage.removeItem(this.LEGACY_STORAGE_KEY);
    localStorage.removeItem(this.storageKey());
  }

  private updateLocalItems(updater: (items: CartItem[]) => CartItem[]) {
    this.cartItems.update(updater);
    this.persistLocalCart();
  }

  private persistLocalCart() {
    if (this.isDatabaseCartEnabled()) {
      return;
    }
    localStorage.setItem(this.storageKey(), JSON.stringify(this.cartItems()));
  }

  private readLocalCart(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey());
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      localStorage.removeItem(this.storageKey());
      return [];
    }
  }

  private isDatabaseCartEnabled(): boolean {
    return this.authService.isAuthenticated() && this.authService.hasRole('ROLE_CLIENT');
  }

  private storageKey(): string {
    const user = this.authService.currentUser();
    const key = this.getUserKey(user);
    return key ? `isgaarti_cart_${key}` : this.GUEST_STORAGE_KEY;
  }

  private getUserKey(user: ReturnType<AuthService['currentUser']>): string | null {
    if (!user) return null;
    return String(user.id || user.email || '').replace(/[^a-zA-Z0-9_.-]/g, '_');
  }
}
