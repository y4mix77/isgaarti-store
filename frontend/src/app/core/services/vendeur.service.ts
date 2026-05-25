import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay } from 'rxjs';
import { Produit, Categorie } from './product.service';

export interface Fournisseur {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  latency?: number;
}

export interface PromotionLocale {
  pourcentage: number;
  dateFin: string;
  nom?: string;
}

export interface VendeurDashboardData {
  vendor: { id: number; nom: string; email: string };
  kpis: {
    revenue: number;
    shipments: number;
    products: number;
    stock: number;
    inventoryValue: number;
    activePromotions: number;
  };
  products: any[];
  promotions: any[];
  shipments: any[];
  activity: any[];
  revenueSeries: number[];
}

@Injectable({
  providedIn: 'root'
})
export class VendeurService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/vendeur';

  // 1. Full CRUD for Seller Products
  getMesProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.API_URL}/produits`).pipe(delay(800));
  }

  getDashboard(): Observable<VendeurDashboardData> {
    const timestamp = new Date().getTime();
    return this.http.get<VendeurDashboardData>(`${this.API_URL}/dashboard?_=${timestamp}`);
  }

  addProduit(data: any): Observable<Produit> {
    return this.http.post<Produit>(`${this.API_URL}/produits`, data);
  }

  updateProduit(id: number, data: any): Observable<Produit> {
    return this.http.put<Produit>(`${this.API_URL}/produits/${id}`, data);
  }

  deleteProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/produits/${id}`);
  }

  // 2. Suppliers (Fournisseurs)
  getFournisseurs(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(`${this.API_URL}/fournisseurs`);
  }

  addFournisseur(data: any): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(`${this.API_URL}/fournisseurs`, data);
  }

  associerFournisseurs(productId: number, fournisseurIds: number[]): Observable<any> {
    return this.http.post(`${this.API_URL}/produits/${productId}/fournisseurs`, { fournisseurIds });
  }

  // 3. Local Promotions
  addPromotionLocale(productId: number, promo: PromotionLocale): Observable<any> {
    return this.http.post(`${this.API_URL}/produits/${productId}/promotion`, promo);
  }

  removePromotionLocale(productId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/produits/${productId}/promotion`);
  }

  deletePromotion(promoId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/promotions/${promoId}`);
  }

  togglePromotionLocale(productId: number): Observable<any> {
    return this.http.patch(`${this.API_URL}/produits/${productId}/promotion/toggle`, {});
  }

  togglePromotionById(promoId: number): Observable<any> {
    return this.http.patch(`${this.API_URL}/promotions/${promoId}/toggle`, {});
  }

  // 4. ImageKit.io Upload Integration
  // We send the file to our Spring Boot backend which handles the secure upload to ImageKit
  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.API_URL}/upload-image`, formData);
  }
}
