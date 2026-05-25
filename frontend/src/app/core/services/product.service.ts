import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay } from 'rxjs';

export interface Categorie {
  id: number;
  nom: string;
}

export interface Produit {
  id: number;
  nom: string;
  prix: number;
  stock: number;
  description?: string;
  image?: string;
  images?: string;
  promo?: number;
  promoEnd?: string;
  promoActive?: boolean;
  promoId?: number;
  promoName?: string;
  promoCode?: string;
  promoScope?: 'GLOBAL' | 'CATEGORIE' | 'PRODUIT' | string;
  promoDeletable?: boolean;
  categorie?: Categorie;
  vendeur?: {
    id: number;
    nom: string;
    productCount?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/produits';

  getProducts(): Observable<Produit[]> {
    // Add a cache-buster timestamp to ensure we get the latest promotions
    const timestamp = new Date().getTime();
    return this.http.get<Produit[]>(`${this.API_URL}?_=${timestamp}`).pipe(delay(800));
  }

  getProduct(id: number): Observable<Produit> {
    const timestamp = new Date().getTime();
    return this.http.get<Produit>(`${this.API_URL}/${id}?_=${timestamp}`);
  }

  createProduct(productData: any): Observable<Produit> {
    return this.http.post<Produit>(this.API_URL, productData);
  }

  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>('http://localhost:8080/api/categories');
  }

  removePromotionLocale(productId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/produits/${productId}/promotion`);
  }

  togglePromotionLocale(productId: number): Observable<any> {
    return this.http.patch(`${this.API_URL}/produits/${productId}/promotion/toggle`, {});
  }
}
