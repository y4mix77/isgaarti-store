import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';

  // 1. Gestion Vendeurs & Utilisateurs
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/utilisateurs`);
  }

  getPendingUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/utilisateurs/pending`);
  }

  approveUser(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/utilisateurs/${userId}/approve`, {}, { responseType: 'text' });
  }

  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/utilisateurs/${userId}/role`, { role });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/utilisateurs/${userId}`, { responseType: 'text' });
  }

  approuverVendeur(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/utilisateurs/${userId}/approuver-vendeur`, {});
  }

  // 2. Gestion des Catégories
  getAllCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  getCategorieOperations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories/operations`);
  }

  creerCategorie(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, data);
  }

  updateCategorie(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/categories/${id}`, data);
  }

  deleteCategorie(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`, { responseType: 'text' });
  }

  // 3. Gestion des Promotions Globales
  getAllPromotions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/promotions`);
  }

  lancerPromotionGlobale(pourcentage: number, dateFin: string, options: any = {}): Observable<any> {
    return this.http.post(`${this.apiUrl}/promotions/global`, {
      pourcentage,
      dateFin,
      ...options
    });
  }

  togglePromotionStatus(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/promotions/${id}/toggle`, {});
  }

  deletePromotion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/promotions/${id}`, { responseType: 'text' });
  }

  // 4. Statistiques Produits
  getAdminStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/stats`);
  }
}
