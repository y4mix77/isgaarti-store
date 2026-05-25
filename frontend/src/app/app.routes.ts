import { Routes } from '@angular/router';
import { guestGuard, adminGuard, vendeurGuard, clientGuard } from './core/guards/guards';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/storefront/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'produits',
        loadComponent: () => import('./features/storefront/products/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'produits/:id',
        loadComponent: () => import('./features/storefront/products/product-details/product-details.component').then(m => m.ProductDetailsComponent)
      },
      {
        path: 'panier',
        loadComponent: () => import('./features/storefront/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'commandes',
        canActivate: [clientGuard],
        loadComponent: () => import('./features/storefront/orders/client-orders.component').then(m => m.ClientOrdersComponent)
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'admin/vendeurs',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/vendeurs/admin-vendeurs.component').then(m => m.AdminVendeursComponent)
      },
      {
        path: 'admin/categories',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/categories/admin-categories.component').then(m => m.AdminCategoriesComponent)
      },
      {
        path: 'admin/promotions',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/promotions/admin-promotions.component').then(m => m.AdminPromotionsComponent)
      },
      {
        path: 'admin/produits/nouveau',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/products/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'vendeur',
        canActivate: [vendeurGuard],
        loadComponent: () => import('./features/vendeur/dashboard/vendeur-dashboard.component').then(m => m.VendeurDashboardComponent)
      },
      {
        path: 'vendeur/inventaire',
        canActivate: [vendeurGuard],
        loadComponent: () => import('./features/vendeur/inventory/vendeur-inventory.component').then(m => m.VendeurInventoryComponent)
      },
      {
        path: 'vendeur/fournisseurs',
        canActivate: [vendeurGuard],
        loadComponent: () => import('./features/vendeur/fournisseurs/vendeur-fournisseurs.component').then(m => m.VendeurFournisseursComponent)
      },
      {
        path: 'vendeur/promotions',
        canActivate: [vendeurGuard],
        loadComponent: () => import('./features/vendeur/promotions/vendeur-promotions.component').then(m => m.VendeurPromotionsComponent)
      },
      {
        path: 'vendeur/commandes',
        canActivate: [vendeurGuard],
        loadComponent: () => import('./features/vendeur/orders/vendeur-orders.component').then(m => m.VendeurOrdersComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
