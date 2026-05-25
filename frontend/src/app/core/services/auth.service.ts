import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  
  // Using Signals for synchronous state
  private tokenSignal = signal<string | null>(localStorage.getItem('token'));
  private userSignal = signal<User | null>(this.parseToken(localStorage.getItem('token')));

  // Computed signals
  public isAuthenticated = computed(() => !!this.userSignal());
  public currentUser = computed(() => this.userSignal());

  constructor(private http: HttpClient, private router: Router) {
    // If token exists but is invalid/expired, clear it
    if (this.tokenSignal() && !this.userSignal()) {
      localStorage.removeItem('token');
      this.tokenSignal.set(null);
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_URL}/signin`, credentials, { responseType: 'text' }).pipe(
      tap(token => this.handleAuthentication(token))
    );
  }

  register(userData: any): Observable<any> {
    const payload = {
      nom: userData.name,
      email: userData.email,
      password: userData.password,
      roles: [userData.role === 'ROLE_VENDEUR' ? 'vendeur' : 'client']
    };
    return this.http.post(`${this.API_URL}/signup`, payload, { responseType: 'text' });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user ? user.roles.includes(role) : false;
  }

  private handleAuthentication(token: string): void {
    localStorage.setItem('token', token);
    this.tokenSignal.set(token);
    this.userSignal.set(this.parseToken(token));
  }

  private parseToken(token: string | null): User | null {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      
      // Map roles depending on the backend implementation. Assuming 'roles' claim is an array or comma separated string.
      let roles: string[] = [];
      if (decoded.roles) {
        roles = Array.isArray(decoded.roles) ? decoded.roles : decoded.roles.split(',');
      } else if (decoded.role) {
        roles = [decoded.role];
      }

      return {
        id: decoded.sub || decoded.id,
        email: decoded.email || decoded.sub,
        roles: roles
      };
    } catch (e) {
      return null;
    }
  }
}
