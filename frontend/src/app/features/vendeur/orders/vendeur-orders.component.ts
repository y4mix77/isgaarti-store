import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { OrderService, VendorOrderLine } from '../../../core/services/order.service';

@Component({
  selector: 'app-vendeur-orders',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CurrencyPipe, DatePipe],
  template: `
    <div class="bg-glow"></div>
    <div class="bg-grid"></div>
    <main class="vendor-orders relative z-10 max-w-[1700px] mx-auto px-[4%] pt-20 pb-32">
      <section class="relative mb-24">
        <h1 class="hero-watermark">Commandes</h1>
        <div class="command-hero">
          <div>
            <div class="hero-kicker">
              <span>Fulfillment_Core</span>
              <div></div>
            </div>
            <h2>Gestion des <span>Commandes</span></h2>
            <p><lucide-icon name="truck" class="w-4 h-4"></lucide-icon> Préparation, emballage, expédition et livraison client</p>
          </div>
          <div class="hero-console">
            <lucide-icon name="radio-tower" class="w-5 h-5"></lucide-icon>
            <div>
              <p>Command Center</p>
              <strong>Orders Live</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="ops-ticket">
          <div>
            <lucide-icon name="shopping-cart" class="stat-bg-icon"></lucide-icon>
            <div class="stat-core"><lucide-icon name="shopping-cart" class="w-5 h-5"></lucide-icon></div>
            <span>Commandes</span>
            <strong>{{ orders().length }}</strong>
            <em>Flux client actifs</em>
          </div>
          <div>
            <lucide-icon name="banknote" class="stat-bg-icon"></lucide-icon>
            <div class="stat-core"><lucide-icon name="banknote" class="w-5 h-5"></lucide-icon></div>
            <span>Revenue</span>
            <strong>{{ revenue() | currency:'MAD':'symbol':'1.0-0' }}</strong>
            <em>Valeur payée</em>
          </div>
          <div>
            <lucide-icon name="truck" class="stat-bg-icon"></lucide-icon>
            <div class="stat-core"><lucide-icon name="truck" class="w-5 h-5"></lucide-icon></div>
            <span>À expédier</span>
            <strong>{{ toShip() }}</strong>
            <em>Préparation en cours</em>
          </div>
      </section>

      <section class="ops-layout">
        <aside class="status-rail">
          <div class="filter-head">
            <div>
              <span>Filtre intelligent</span>
              <strong>{{ filteredOrders().length }} lignes</strong>
            </div>
            <button
              type="button"
              class="filter-reset-icon"
              (click)="resetFilters()"
              [disabled]="filter() === 'ALL' && !searchQuery()"
              title="Réinitialiser les filtres"
            >
              <lucide-icon name="refresh-cw" class="w-4 h-4"></lucide-icon>
            </button>
          </div>

          <label class="order-search">
            <lucide-icon name="search" class="w-4 h-4"></lucide-icon>
            <input
              type="text"
              [value]="searchQuery()"
              (input)="setSearchQuery($event)"
              placeholder="Commande, client, produit..."
            />
          </label>

          <div class="filter-signal">
            <div>
              <span>Page active</span>
              <strong>{{ pageStartIndex() + 1 }}-{{ pageEndIndex() }}</strong>
            </div>
            <div>
              <span>Valeur filtrée</span>
              <strong>{{ filteredRevenue() | currency:'MAD':'symbol':'1.0-0' }}</strong>
            </div>
          </div>

          <div class="status-dropdown" [class.open]="isFilterDropdownOpen()">
            <button type="button" class="status-dropdown-trigger" (click)="toggleFilterDropdown()">
              <span>
                <lucide-icon [name]="selectedStatus().icon" class="w-4 h-4"></lucide-icon>
                <em>{{ selectedStatus().label }}</em>
              </span>
              <strong>{{ countStatus(selectedStatus().key) }}</strong>
              <lucide-icon name="chevron-down" class="dropdown-chevron w-4 h-4"></lucide-icon>
            </button>

            @if (isFilterDropdownOpen()) {
              <div class="status-dropdown-menu">
                @for (status of statuses; track status.key) {
                  <button type="button" [class.active]="filter() === status.key" (click)="selectFilter(status.key)">
                    <lucide-icon [name]="status.icon" class="w-4 h-4"></lucide-icon>
                    <span>{{ status.label }}</span>
                    <strong>{{ countStatus(status.key) }}</strong>
                  </button>
                }
              </div>
            }
          </div>

        </aside>

        <div class="orders-stream">
          @if (loading()) {
            <div class="empty-panel"><lucide-icon name="refresh-cw" class="w-7 h-7 animate-spin"></lucide-icon><span>Synchronisation des commandes...</span></div>
          } @else if (!filteredOrders().length) {
            <div class="empty-panel"><lucide-icon name="inbox" class="w-8 h-8"></lucide-icon><h2>Aucune commande dans ce statut</h2></div>
          } @else {
            <div class="orders-table-shell">
              <table class="orders-table">
                <thead>
                  <tr>
                    <th>Commande</th>
                    <th>Produit</th>
                    <th>Client</th>
                    <th>Livraison</th>
                    <th>Quantité</th>
                    <th>Valeur</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  @for (order of paginatedOrders(); track order.id) {
                    <tr>
                      <td>
                        <div class="order-ref">
                          <strong>{{ order.orderNumber }}</strong>
                          <span>{{ order.createdAt | date:'dd MMM, HH:mm' }} · {{ order.paymentStatus }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="product-cell">
                          <div class="product-media">
                            <img *ngIf="order.image" [src]="order.image" [alt]="order.product">
                            <lucide-icon *ngIf="!order.image" name="package" class="w-5 h-5"></lucide-icon>
                          </div>
                          <div>
                            <strong>{{ order.product }}</strong>
                            <span>SKU-{{ order.productId }}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="data-cell">
                          <strong>{{ order.clientName || 'Client' }}</strong>
                          <span>{{ order.clientEmail }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="data-cell">
                          <strong>{{ order.shippingCity }}, {{ order.shippingCountry }}</strong>
                          <span>{{ order.shippingAddress }}</span>
                          <small>{{ order.shippingPhone || '-' }}</small>
                        </div>
                      </td>
                      <td><div class="qty-pill">{{ order.quantity }} x {{ order.unitPrice | currency:'MAD':'symbol':'1.0-0' }}</div></td>
                      <td><div class="value-chip"><strong>{{ order.value | currency:'MAD':'symbol':'1.0-0' }}</strong></div></td>
                      <td>
                        <div class="status-selector table-selector" [class.open]="openSelectorId() === order.lineId" [class]="statusTone(order.fulfillmentStatus)">
                          <button type="button" class="selector-trigger" (click)="toggleSelector(order)" [disabled]="savingId() === order.lineId">
                            <span>Statut</span>
                            <strong>
                              <i></i>
                              <lucide-icon [name]="statusIcon(order.fulfillmentStatus)" class="w-4 h-4"></lucide-icon>
                              {{ statusLabel(order.fulfillmentStatus) }}
                            </strong>
                            <lucide-icon name="chevron-down" class="selector-chevron w-4 h-4"></lucide-icon>
                          </button>
                          @if (openSelectorId() === order.lineId) {
                            <div class="selector-menu">
                              @for (step of dropdownStatuses; track step.key) {
                                <button type="button" [class]="statusTone(step.key)" [class.active]="order.fulfillmentStatus === step.key" (click)="changeStatus(order, step.key)">
                                  <i></i>
                                  <lucide-icon [name]="step.icon" class="w-4 h-4"></lucide-icon>
                                  <span>{{ step.label }}</span>
                                </button>
                              }
                            </div>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (filteredOrders().length > pageSize) {
              <div class="orders-pagination">
                <button type="button" class="page-nav" (click)="previousPage()" [disabled]="currentPage() === 1" title="Page précédente">
                  <lucide-icon name="arrow-left" class="w-4 h-4"></lucide-icon>
                </button>
                <div class="page-center">
                  <div>
                    <span>Commandes affichées</span>
                    <strong>{{ pageStartIndex() + 1 }}-{{ pageEndIndex() }} / {{ filteredOrders().length }}</strong>
                  </div>
                  <div class="page-dots">
                    @for (page of pages(); track page) {
                      <button type="button" [class.active]="currentPage() === page" (click)="goToPage(page)">
                        {{ page }}
                      </button>
                    }
                  </div>
                </div>
                <button type="button" class="page-nav" (click)="nextPage()" [disabled]="currentPage() === totalPages()" title="Page suivante">
                  <lucide-icon name="arrow-right" class="w-4 h-4"></lucide-icon>
                </button>
              </div>
            }
          }
        </div>
      </section>
    </main>
  `,
  styles: [`
    .vendor-orders { color: white; }
    .hero-watermark { font-size: clamp(6rem, 13vw, 14rem); font-weight: 950; letter-spacing: -0.07em; color: rgba(255,255,255,0.02); position: absolute; top: -8rem; left: -3rem; pointer-events: none; user-select: none; text-transform: uppercase; }
    .command-hero { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 2.5rem; }
    @media (min-width: 768px) { .command-hero { flex-direction: row; align-items: end; justify-content: space-between; } }
    .hero-kicker { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .hero-kicker span { padding: 0.25rem 0.75rem; border-radius: 0.25rem; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); color: #f59e0b; font-size: 9px; font-weight: 950; letter-spacing: 0.4em; text-transform: uppercase; }
    .hero-kicker div { width: 3rem; height: 1px; background: #27272a; }
    .command-hero h2 { font-size: clamp(4rem, 8vw, 8rem); line-height: 0.88; font-weight: 950; letter-spacing: -0.07em; margin-bottom: 1.5rem; }
    .command-hero h2 span { color: transparent; background: linear-gradient(90deg, #f59e0b, #fde68a); -webkit-background-clip: text; background-clip: text; }
    .command-hero p { color: #71717a; font-size: 10px; font-weight: 950; letter-spacing: 0.2em; text-transform: uppercase; display: flex; align-items: center; gap: 0.75rem; }
    .command-hero p lucide-icon { color: #f59e0b; }
    .hero-console { display: flex; align-items: center; gap: 0.75rem; border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.05); background: rgba(9,9,11,0.6); padding: 1rem 1.25rem; }
    .hero-console > div { display: block; min-width: max-content; }
    .hero-console lucide-icon { color: #f59e0b; }
    .hero-console p { font-size: 8px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.35em; color: #52525b; margin: 0; display: block; }
    .hero-console strong { color: white; font-size: 0.75rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.18em; }
    .ops-ticket { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-bottom: 2.5rem; }
    .ops-ticket div { position: relative; min-height: 104px; padding: 16px 18px; border-radius: 8px; background: linear-gradient(135deg, rgba(18,18,20,0.88), rgba(5,5,6,0.94)); border: 1px solid rgba(255,255,255,0.07); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 54px rgba(0,0,0,0.28); overflow: hidden; }
    .ops-ticket div::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(245,158,11,0.12), transparent 36%, rgba(255,255,255,0.025)); pointer-events: none; }
    .stat-bg-icon { position: absolute; right: -10px; bottom: -14px; width: 92px; height: 92px; color: rgba(245,158,11,0.055); transform: rotate(-10deg); filter: drop-shadow(0 0 20px rgba(245,158,11,0.08)); pointer-events: none; }
    .stat-core { display: none; }
    .ops-ticket span, .status-rail span, .client-grid span, .value-chip span { display: block; color: #f59e0b; font-size: 0.58rem; font-weight: 950; letter-spacing: 0.24em; text-transform: uppercase; }
    .ops-ticket span, .ops-ticket strong, .ops-ticket em { position: relative; z-index: 1; }
    .ops-ticket strong { display: block; margin-top: 8px; font-size: clamp(1.25rem, 2.2vw, 1.65rem); line-height: 1; font-family: monospace; color: white; letter-spacing: -0.04em; }
    .ops-ticket em { display: block; margin-top: 8px; color: #71717a; font-size: 0.56rem; font-weight: 850; font-style: normal; text-transform: uppercase; letter-spacing: 0.1em; }
    .ops-layout { display: grid; grid-template-columns: 310px 1fr; gap: 22px; margin-top: 28px; align-items: start; }
    .status-rail { position: sticky; top: 22px; display: grid; gap: 10px; padding: 14px; border-radius: 24px; background: linear-gradient(145deg, rgba(10,10,12,0.86), rgba(5,5,6,0.96)); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(26px); box-shadow: 0 28px 80px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08); overflow: visible; }
    .status-rail::before { content: ''; position: absolute; left: 18px; right: 18px; top: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(245,158,11,0.85), rgba(255,255,255,0.42), transparent); }
    .filter-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 4px 4px 10px; }
    .filter-head span, .filter-signal span, .page-center span { display: block; color: #71717a; font-size: 0.5rem; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 5px; }
    .filter-head strong, .filter-signal strong, .page-center strong { display: block; color: white; font-size: 0.78rem; font-weight: 950; font-family: monospace; white-space: nowrap; }
    .filter-reset-icon { width: 38px; height: 38px; border-radius: 13px; display: inline-flex; align-items: center; justify-content: center; color: #f59e0b; background: rgba(245,158,11,0.09); border: 1px solid rgba(245,158,11,0.18); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08); transition: 0.2s ease; }
    .filter-reset-icon:hover:not(:disabled) { color: #050506; background: #f59e0b; transform: translateY(-2px) rotate(-16deg); box-shadow: 0 12px 28px rgba(245,158,11,0.18); }
    .filter-reset-icon:disabled { opacity: 0.32; cursor: not-allowed; }
    .order-search { min-height: 48px; display: flex; align-items: center; gap: 10px; padding: 0 12px; border-radius: 15px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.08); color: #f59e0b; transition: 0.2s ease; }
    .order-search:focus-within { border-color: rgba(245,158,11,0.42); box-shadow: 0 0 0 4px rgba(245,158,11,0.06); }
    .order-search input { width: 100%; min-width: 0; background: transparent; border: 0; outline: 0; color: white; font-size: 0.78rem; font-weight: 850; }
    .order-search input::placeholder { color: #52525b; }
    .filter-signal { display: grid; grid-template-columns: 1fr; gap: 8px; }
    .filter-signal div { padding: 10px 11px; border-radius: 14px; background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.1); min-width: 0; }
    .status-dropdown { position: relative; z-index: 80; }
    .status-dropdown-trigger { width: 100%; min-height: 58px; padding: 0 44px 0 13px; border-radius: 17px; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: center; text-align: left; color: white; background: linear-gradient(135deg, rgba(245,158,11,0.13), rgba(255,255,255,0.035)); border: 1px solid rgba(245,158,11,0.18); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08); position: relative; transition: 0.2s ease; }
    .status-dropdown-trigger:hover { border-color: rgba(245,158,11,0.42); transform: translateY(-1px); }
    .status-dropdown-trigger span { min-width: 0; display: flex; align-items: center; gap: 10px; color: #f59e0b; }
    .status-dropdown-trigger em { color: white; font-size: 0.72rem; font-style: normal; font-weight: 950; letter-spacing: 0.12em; text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .status-dropdown-trigger strong, .status-dropdown-menu strong, .status-rail strong { color: #f59e0b; font-family: monospace; }
    .dropdown-chevron { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #f59e0b; transition: 0.2s ease; }
    .status-dropdown.open .dropdown-chevron { transform: translateY(-50%) rotate(180deg); }
    .status-dropdown-menu { position: absolute; left: -6px; right: -6px; top: calc(100% + 12px); padding: 10px; border-radius: 22px; background: linear-gradient(145deg, rgba(16,16,18,0.99), rgba(3,3,4,0.99)); border: 1px solid rgba(245,158,11,0.26); box-shadow: 0 34px 100px rgba(0,0,0,0.74), 0 0 0 1px rgba(255,255,255,0.045), inset 0 1px 0 rgba(255,255,255,0.1); backdrop-filter: blur(30px); display: grid; gap: 7px; overflow: hidden; }
    .status-dropdown-menu::before { content: ''; position: absolute; left: 18px; right: 18px; top: 0; height: 1px; background: linear-gradient(90deg, transparent, #f59e0b, rgba(255,255,255,0.65), transparent); }
    .status-dropdown-menu::after { content: ''; position: absolute; right: -34px; bottom: -34px; width: 110px; height: 110px; border-radius: 999px; background: rgba(245,158,11,0.12); filter: blur(34px); pointer-events: none; }
    .status-dropdown-menu button { position: relative; z-index: 1; display: grid; grid-template-columns: 20px 1fr auto; gap: 10px; align-items: center; min-height: 44px; padding: 0 11px; border-radius: 14px; color: #a1a1aa; background: rgba(255,255,255,0.026); border: 1px solid rgba(255,255,255,0.055); text-align: left; transition: 0.18s ease; }
    .status-dropdown-menu button.active, .status-dropdown-menu button:hover { color: white; border-color: rgba(245,158,11,0.32); background: rgba(245,158,11,0.1); }
    .orders-stream { display: grid; gap: 14px; }
    .orders-table-shell { position: relative; border-radius: 24px; background: rgba(10,10,12,0.72); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 28px 90px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.08); padding: 14px; overflow: visible; }
    .orders-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
    .orders-table th { color: #52525b; font-size: 0.62rem; font-weight: 950; letter-spacing: 0.2em; text-transform: uppercase; text-align: left; padding: 0 14px 9px; white-space: nowrap; }
    .orders-table td { position: relative; background: rgba(255,255,255,0.035); border-top: 1px solid rgba(255,255,255,0.055); border-bottom: 1px solid rgba(255,255,255,0.055); padding: 15px 14px; vertical-align: middle; }
    .orders-table tr td:first-child { border-left: 1px solid rgba(255,255,255,0.055); border-top-left-radius: 18px; border-bottom-left-radius: 18px; }
    .orders-table tr td:last-child { border-right: 1px solid rgba(255,255,255,0.055); border-top-right-radius: 18px; border-bottom-right-radius: 18px; }
    .orders-table tbody tr { transition: 0.2s ease; }
    .orders-table tbody tr:hover td { background: rgba(245,158,11,0.055); border-color: rgba(245,158,11,0.18); }
    .order-ref strong, .data-cell strong, .product-cell strong { display: block; color: white; font-size: 0.84rem; font-weight: 950; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 210px; }
    .order-ref strong { color: #f59e0b; font-family: monospace; max-width: 155px; }
    .order-ref span, .data-cell span, .product-cell span, .data-cell small { display: block; color: #71717a; font-size: 0.68rem; font-weight: 800; margin-top: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px; }
    .product-cell { display: grid; grid-template-columns: 56px 1fr; gap: 12px; align-items: center; min-width: 235px; }
    .orders-table .product-media, .orders-table .product-media img { width: 56px; height: 56px; border-radius: 14px; }
    .qty-pill { display: inline-flex; align-items: center; min-height: 38px; padding: 0 12px; border-radius: 999px; background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.065); color: white; font-size: 0.72rem; font-weight: 950; white-space: nowrap; }
    .orders-table .value-chip { min-width: 0; width: max-content; padding: 11px 13px; border-radius: 13px; background: rgba(245,158,11,0.14); color: #f59e0b; border: 1px solid rgba(245,158,11,0.22); }
    .orders-table .value-chip strong { margin: 0; color: #fbbf24; font-size: 0.84rem; }
    .table-selector { min-width: 230px; z-index: 10; }
    .table-selector.open { z-index: 30; }
    .table-selector .selector-trigger { min-height: 52px; border-radius: 14px; padding: 8px 38px 8px 12px; }
    .table-selector .selector-trigger strong { font-size: 0.72rem; margin-top: 4px; }
    .table-selector .selector-trigger span { font-size: 0.44rem; }
    .table-selector .selector-menu { z-index: 50; }
    .fulfillment-card { position: relative; padding: 18px; border-radius: 24px; background: linear-gradient(135deg, rgba(18,18,20,0.86), rgba(8,8,10,0.92)); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 26px 80px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.08); overflow: hidden; }
    .scan-line { position: absolute; left: 18px; right: 18px; top: 0; height: 1px; background: linear-gradient(90deg, transparent, #f59e0b, transparent); }
    .card-head { display: grid; grid-template-columns: 82px 1fr auto; gap: 16px; align-items: center; }
    .product-media, .product-media img { width: 82px; height: 82px; border-radius: 18px; object-fit: cover; background: #09090b; }
    .product-media { display: flex; align-items: center; justify-content: center; color: #71717a; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
    .card-title span { color: #f59e0b; font-family: monospace; font-size: 0.7rem; font-weight: 950; }
    .card-title h2 { margin: 4px 0; font-size: 1.35rem; font-weight: 950; text-transform: uppercase; letter-spacing: -0.03em; }
    .card-title p { color: #71717a; font-size: 0.72rem; font-weight: 800; }
    .value-chip { min-width: 132px; padding: 14px; border-radius: 16px; background: #f59e0b; color: #09090b; }
    .value-chip span { color: rgba(0,0,0,0.55); }
    .value-chip strong { display: block; margin-top: 6px; font-family: monospace; font-size: 1.1rem; }
    .client-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 16px 0; }
    .client-grid div { padding: 13px; border-radius: 15px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.055); min-width: 0; }
    .client-grid strong { display: block; margin-top: 7px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .client-grid p { color: #71717a; font-size: 0.68rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .status-command-row { display: grid; grid-template-columns: 1fr 250px; gap: 12px; align-items: stretch; }
    .status-orbit { display: flex; align-items: center; gap: 12px; min-height: 66px; border-radius: 16px; padding: 13px 15px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07); }
    .status-orbit > span { width: 13px; height: 13px; border-radius: 50%; background: var(--tone); box-shadow: 0 0 18px var(--tone); }
    .status-orbit small, .selector-trigger span { display: block; color: #71717a; font-size: 0.5rem; font-weight: 950; letter-spacing: 0.2em; text-transform: uppercase; }
    .status-orbit strong { display: block; color: white; margin-top: 4px; font-size: 0.74rem; font-weight: 950; letter-spacing: 0.08em; text-transform: uppercase; }
    .status-selector { position: relative; z-index: 3; }
    .selector-trigger { position: relative; width: 100%; min-height: 66px; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; border-radius: 16px; padding: 10px 42px 10px 14px; background: color-mix(in srgb, var(--tone) 13%, rgba(255,255,255,0.035)); border: 1px solid color-mix(in srgb, var(--tone) 35%, rgba(255,255,255,0.08)); text-align: left; overflow: hidden; transition: 0.2s ease; }
    .selector-trigger:hover { border-color: color-mix(in srgb, var(--tone) 60%, rgba(255,255,255,0.12)); transform: translateY(-1px); }
    .selector-trigger strong { display: inline-flex; align-items: center; gap: 8px; margin-top: 6px; color: white; font-size: 0.76rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.08em; }
    .selector-trigger i, .selector-menu i { width: 9px; height: 9px; border-radius: 50%; background: var(--tone); box-shadow: 0 0 15px var(--tone); flex: 0 0 auto; }
    .selector-trigger lucide-icon:not(.selector-chevron), .selector-menu lucide-icon { color: var(--tone); }
    .selector-chevron { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--tone); transition: 0.2s ease; }
    .status-selector.open .selector-chevron { transform: translateY(-50%) rotate(180deg); }
    .selector-menu { position: absolute; left: 0; right: 0; top: calc(100% + 8px); padding: 8px; border-radius: 18px; background: rgba(9,9,11,0.96); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 24px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08); backdrop-filter: blur(24px); display: grid; gap: 6px; }
    .selector-menu button { display: grid; grid-template-columns: 10px 18px 1fr; align-items: center; gap: 9px; min-height: 38px; padding: 0 10px; border-radius: 12px; color: white; background: transparent; border: 1px solid transparent; text-align: left; font-size: 0.68rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.08em; }
    .selector-menu button:hover, .selector-menu button.active { background: color-mix(in srgb, var(--tone) 13%, transparent); border-color: color-mix(in srgb, var(--tone) 32%, rgba(255,255,255,0.08)); }
    .tone-preparation { --tone: #f59e0b; }
    .tone-emballee { --tone: #38bdf8; }
    .tone-expedition { --tone: #c084fc; }
    .tone-livree { --tone: #22c55e; }
    .tone-annulee { --tone: #ef4444; }
    .empty-panel { min-height: 340px; border-radius: 24px; border: 1px dashed rgba(255,255,255,0.12); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #a1a1aa; gap: 12px; }
    .orders-pagination { margin-top: 16px; padding: 12px; border-radius: 22px; display: grid; grid-template-columns: 48px minmax(0, 1fr) 48px; gap: 12px; align-items: center; background: linear-gradient(135deg, rgba(24,24,27,0.74), rgba(5,5,6,0.92)); border: 1px solid rgba(255,255,255,0.09); box-shadow: 0 22px 66px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.08); position: relative; overflow: hidden; }
    .orders-pagination::before { content: ''; position: absolute; left: 18px; right: 18px; top: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(245,158,11,0.85), rgba(255,255,255,0.42), transparent); }
    .page-nav { width: 48px; height: 48px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; color: #f59e0b; background: rgba(245,158,11,0.09); border: 1px solid rgba(245,158,11,0.18); transition: 0.2s ease; }
    .page-nav:hover:not(:disabled) { color: #050506; background: #f59e0b; transform: translateY(-2px); box-shadow: 0 14px 34px rgba(245,158,11,0.18); }
    .page-nav:disabled { opacity: 0.35; cursor: not-allowed; }
    .page-center { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 14px; min-width: 0; }
    .page-dots { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 7px; }
    .page-dots button { min-width: 34px; height: 34px; padding: 0 9px; border-radius: 12px; color: #71717a; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07); font-size: 0.68rem; font-weight: 950; font-family: monospace; transition: 0.2s ease; }
    .page-dots button:hover, .page-dots button.active { color: #050506; background: #f59e0b; border-color: rgba(245,158,11,0.75); box-shadow: 0 10px 24px rgba(245,158,11,0.14); }
    @media (max-width: 1180px) { .orders-table-shell { overflow-x: auto; } .orders-table { min-width: 1040px; } }
    @media (max-width: 1040px) { .ops-layout, .card-head, .client-grid, .status-command-row { grid-template-columns: 1fr; } .ops-ticket { grid-template-columns: 1fr; } .status-rail { position: relative; top: auto; } }
    @media (max-width: 640px) { .orders-pagination { grid-template-columns: 44px minmax(0, 1fr) 44px; gap: 8px; } .page-nav { width: 44px; height: 44px; } .page-center { flex-direction: column; align-items: stretch; } .page-dots { justify-content: flex-start; } }
  `]
})
export class VendeurOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  orders = signal<VendorOrderLine[]>([]);
  loading = signal(true);
  filter = signal('ALL');
  searchQuery = signal('');
  readonly pageSize = 4;
  currentPage = signal(1);
  isFilterDropdownOpen = signal(false);
  savingId = signal<number | null>(null);
  openSelectorId = signal<number | null>(null);
  statuses = [
    { key: 'ALL', label: 'Toutes', icon: 'list' },
    { key: 'PREPARATION', label: 'Préparation', icon: 'clock' },
    { key: 'EMBALLEE', label: 'Emballée', icon: 'package-check' },
    { key: 'EXPEDITION', label: 'Expédition', icon: 'truck' },
    { key: 'LIVREE', label: 'Livrée', icon: 'check-circle' },
    { key: 'ANNULEE', label: 'Annulée', icon: 'circle-x' }
  ];
  dropdownStatuses = this.statuses.filter(status => status.key !== 'ALL');
  revenue = computed(() => this.orders().reduce((sum, order) => sum + Number(order.value || 0), 0));
  toShip = computed(() => this.orders().filter(order => !['EXPEDITION', 'LIVREE', 'ANNULEE'].includes(order.fulfillmentStatus)).length);
  selectedStatus = computed(() => this.statuses.find(status => status.key === this.filter()) || this.statuses[0]);
  filteredOrders = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.orders().filter(order => {
      const statusMatches = this.filter() === 'ALL' || order.fulfillmentStatus === this.filter();
      const queryMatches = !query || [
        order.orderNumber,
        order.product,
        order.clientName,
        order.clientEmail,
        order.shippingCity,
        order.shippingCountry
      ].some(value => String(value || '').toLowerCase().includes(query));
      return statusMatches && queryMatches;
    });
  });
  filteredRevenue = computed(() => this.filteredOrders().reduce((sum, order) => sum + Number(order.value || 0), 0));
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredOrders().length / this.pageSize)));
  pageStartIndex = computed(() => (this.currentPage() - 1) * this.pageSize);
  pageEndIndex = computed(() => Math.min(this.pageStartIndex() + this.pageSize, this.filteredOrders().length));
  paginatedOrders = computed(() => this.filteredOrders().slice(this.pageStartIndex(), this.pageEndIndex()));
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getVendorOrders().subscribe({
      next: orders => {
        this.orders.set(orders.map(order => ({ ...order, fulfillmentStatus: order.fulfillmentStatus || 'PREPARATION' })));
        this.clampPage();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setFilter(status: string) {
    this.filter.set(status);
    this.currentPage.set(1);
  }

  toggleFilterDropdown() {
    this.isFilterDropdownOpen.set(!this.isFilterDropdownOpen());
  }

  selectFilter(status: string) {
    this.setFilter(status);
    this.isFilterDropdownOpen.set(false);
  }

  setSearchQuery(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  resetFilters() {
    this.filter.set('ALL');
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.isFilterDropdownOpen.set(false);
  }

  goToPage(page: number) {
    this.currentPage.set(Math.min(Math.max(page, 1), this.totalPages()));
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage() - 1);
  }

  clampPage() {
    this.currentPage.set(Math.min(Math.max(this.currentPage(), 1), this.totalPages()));
  }

  countStatus(status: string): number {
    return status === 'ALL' ? this.orders().length : this.orders().filter(order => order.fulfillmentStatus === status).length;
  }

  changeStatus(order: VendorOrderLine, status: string) {
    if (order.fulfillmentStatus === status || this.savingId()) return;
    this.openSelectorId.set(null);
    this.savingId.set(order.lineId);
    this.orderService.updateVendorLineStatus(order.lineId, status).subscribe({
      next: updated => {
        this.orders.update(list => list.map(item => item.lineId === order.lineId ? { ...item, fulfillmentStatus: updated.fulfillmentStatus || status } : item));
        this.savingId.set(null);
      },
      error: () => this.savingId.set(null)
    });
  }

  statusLabel(status: string): string {
    return this.statuses.find(item => item.key === status)?.label || status || 'Préparation';
  }

  statusIcon(status: string): string {
    return this.statuses.find(item => item.key === status)?.icon || 'clock';
  }

  statusTone(status: string): string {
    return `tone-${String(status || 'PREPARATION').toLowerCase()}`;
  }

  toggleSelector(order: VendorOrderLine) {
    this.openSelectorId.set(this.openSelectorId() === order.lineId ? null : order.lineId);
  }
}
