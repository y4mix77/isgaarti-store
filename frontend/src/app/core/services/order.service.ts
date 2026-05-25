import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderLine {
  id: number;
  productId?: number;
  name: string;
  product?: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
  value?: number;
  fulfillmentStatus: string;
  vendorName?: string;
}

export interface ClientOrder {
  id: number;
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
  createdAt: string;
  updatedAt?: string;
  items: OrderLine[];
}

export interface VendorOrderLine {
  id: string;
  lineId: number;
  orderNumber: string;
  productId: number;
  product: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  value: number;
  status: string;
  fulfillmentStatus: string;
  paymentStatus: string;
  orderTotal: number;
  clientName: string;
  clientEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private readonly CLIENT_API = 'http://localhost:8080/api/commandes';
  private readonly VENDOR_API = 'http://localhost:8080/api/vendeur/commandes';

  getMyOrders(): Observable<ClientOrder[]> {
    return this.http.get<ClientOrder[]>(`${this.CLIENT_API}/mes-commandes`);
  }

  getVendorOrders(): Observable<VendorOrderLine[]> {
    return this.http.get<VendorOrderLine[]>(this.VENDOR_API);
  }

  updateVendorLineStatus(lineId: number | string, status: string): Observable<VendorOrderLine> {
    return this.http.patch<VendorOrderLine>(`${this.VENDOR_API}/lignes/${lineId}/status`, { status });
  }
}
