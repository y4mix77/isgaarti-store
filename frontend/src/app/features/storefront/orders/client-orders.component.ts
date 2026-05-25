import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ClientOrder, OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-client-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, CurrencyPipe, DatePipe],
  template: `
    <main class="orders-page">
      <div class="mesh"></div>
      <section class="orders-hero">
        <div class="hero-copy">
          <div class="hero-kicker">
            <span></span>
            <strong>Client Command Center</strong>
          </div>
          <h1>Mes commandes</h1>
          <p>Un cockpit de suivi pour vos achats, factures, paiements et livraisons ISGAARTI.</p>
          <div class="hero-signal">
            <lucide-icon name="shield-check" class="w-4 h-4"></lucide-icon>
            <span>Suivi sécurisé</span>
            <i></i>
            <span>Factures prêtes</span>
          </div>
        </div>
        <div class="hero-ledger">
          <div><span>Commandes</span><strong>{{ orders().length }}</strong></div>
          <div><span>Total payé</span><strong>{{ totalSpent() | currency:'MAD':'symbol':'1.0-0' }}</strong></div>
          <div><span>Articles</span><strong>{{ totalItems() }}</strong></div>
        </div>
      </section>

      @if (loading()) {
        <div class="empty-state">
          <lucide-icon name="refresh-cw" class="w-7 h-7 animate-spin"></lucide-icon>
          <span>Synchronisation de vos commandes...</span>
        </div>
      } @else if (!orders().length) {
        <div class="empty-state">
          <lucide-icon name="package-open" class="w-8 h-8"></lucide-icon>
          <h2>Aucune commande pour le moment</h2>
          <p>Votre historique apparaîtra ici juste après un paiement confirmé.</p>
          <a routerLink="/produits">Explorer le catalogue</a>
        </div>
      } @else {
        <section class="orders-grid">
          @for (order of orders(); track order.orderNumber) {
            <article class="order-shell">
              <div class="order-top">
                <div>
                  <span class="order-chip">Commande sécurisée</span>
                  <h2>{{ order.orderNumber }}</h2>
                  <p>{{ order.createdAt | date:'dd MMM yyyy, HH:mm' }} · {{ order.paymentStatus }}</p>
                </div>
                <button type="button" class="invoice-btn" (click)="downloadInvoice(order)">
                  <lucide-icon name="file-spreadsheet" class="w-4 h-4"></lucide-icon>
                  Facture
                </button>
              </div>

              <div class="status-line">
                @for (step of steps; track step.key) {
                  <div class="status-step" [class.done]="isStepDone(order, step.key)" [class.active]="currentStep(order) === step.key">
                    <span></span>
                    <strong>{{ step.label }}</strong>
                  </div>
                }
              </div>

              <div class="compact-finance">
                <div><span>Total</span><strong>{{ order.total | currency:'MAD':'symbol':'1.0-0' }}</strong></div>
                <div><span>Livraison</span><strong>{{ shippingLabel(order.shippingCost) }}</strong></div>
                <div><span>Taxes</span><strong>{{ order.taxAmount | currency:'MAD':'symbol':'1.0-0' }}</strong></div>
              </div>

              <div class="items-column">
                  @for (item of order.items.slice(0, 2); track item.id) {
                    <div class="order-item">
                      <img *ngIf="item.image" [src]="item.image" [alt]="item.name">
                      <div *ngIf="!item.image" class="image-fallback"><lucide-icon name="package" class="w-5 h-5"></lucide-icon></div>
                      <div>
                        <span>{{ item.vendorName || 'Vendeur ISGAARTI' }}</span>
                        <strong>{{ item.name }}</strong>
                        <p>{{ item.quantity }} x {{ item.unitPrice | currency:'MAD':'symbol':'1.0-0' }}</p>
                      </div>
                      <em [class]="statusClass(item.fulfillmentStatus)">{{ statusLabel(item.fulfillmentStatus) }}</em>
                    </div>
                  }
                  @if (order.items.length > 2) {
                    <div class="more-items">+ {{ order.items.length - 2 }} article(s) dans cette commande</div>
                  }
              </div>

              <div class="delivery-box">
                <span>Livraison</span>
                <strong>{{ order.clientName }}</strong>
                <p>{{ order.shippingAddress }} · {{ order.shippingCity }}, {{ order.shippingCountry }}</p>
                <small>{{ order.shippingPhone }} · {{ order.clientEmail }}</small>
              </div>
            </article>
          }
        </section>
      }
    </main>
  `,
  styles: [`
    .orders-page { min-height: 100vh; position: relative; overflow: hidden; background: #050506; color: white; padding: 56px clamp(18px,4vw,70px) 110px; }
    .mesh { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px); background-size: 64px 64px; mask-image: linear-gradient(to bottom, black, transparent 92%); }
    .orders-hero { position: relative; display: grid; grid-template-columns: 1fr auto; gap: 28px; align-items: end; padding: 34px 0 30px; border-bottom: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
    .orders-hero::before { content: 'COMMANDES'; position: absolute; left: -18px; top: -32px; font-size: clamp(5rem, 12vw, 12rem); font-weight: 950; letter-spacing: -0.08em; color: rgba(255,255,255,0.026); pointer-events: none; }
    .orders-hero::after { content: ''; position: absolute; left: 0; width: min(520px, 68%); bottom: 0; height: 1px; background: linear-gradient(90deg, #fbbf24, transparent); opacity: 0.45; }
    .hero-copy { position: relative; z-index: 1; }
    .hero-kicker { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .hero-kicker span { width: 8px; height: 8px; border-radius: 999px; background: #fbbf24; box-shadow: 0 0 18px rgba(251,191,36,0.8); }
    .hero-kicker strong { color: #fbbf24; font-size: 0.56rem; font-weight: 950; letter-spacing: 0.32em; text-transform: uppercase; }
    .eyebrow { display: block; color: #fbbf24; font-size: 0.62rem; font-weight: 950; letter-spacing: 0.28em; text-transform: uppercase; margin-bottom: 10px; }
    h1 { font-size: clamp(3rem, 8vw, 7rem); font-weight: 950; letter-spacing: -0.07em; line-height: 0.86; margin: 0; }
    .orders-hero p { color: #8a8a93; max-width: 620px; margin-top: 18px; font-weight: 800; }
    .hero-signal { display: inline-flex; align-items: center; gap: 10px; margin-top: 20px; padding: 9px 12px; border-radius: 999px; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.18); color: #e4e4e7; font-size: 0.66rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.12em; }
    .hero-signal lucide-icon { color: #fbbf24; }
    .hero-signal i { width: 4px; height: 4px; border-radius: 999px; background: #52525b; }
    .hero-ledger { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(3, 128px); gap: 10px; }
    .hero-ledger div, .order-shell, .order-panel { background: rgba(18,18,20,0.74); border: 1px solid rgba(255,255,255,0.08); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 26px 70px rgba(0,0,0,0.34); }
    .hero-ledger div { border-radius: 16px; padding: 16px; }
    .hero-ledger span, .money-row span, .delivery-box span, .ticket-total span { display: block; color: #71717a; font-size: 0.54rem; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; }
    .hero-ledger strong { display: block; margin-top: 8px; font-family: monospace; font-size: 1.2rem; color: white; }
    .orders-grid { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 28px; align-items: start; }
    .order-shell { border-radius: 20px; padding: 16px; overflow: hidden; min-width: 0; }
    .order-top { display: grid; grid-template-columns: 1fr auto; align-items: flex-start; gap: 12px; }
    .order-chip { display: inline-flex; align-items: center; width: fit-content; min-height: 20px; padding: 0 8px; border-radius: 999px; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.18); color: #fbbf24; font-size: 0.48rem; font-weight: 950; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 8px; }
    .order-top h2 { margin: 0; font-family: monospace; color: #fbbf24; font-size: 0.86rem; font-weight: 950; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px; }
    .order-top p { color: #71717a; font-size: 0.62rem; font-weight: 800; margin-top: 5px; }
    .invoice-btn { width: 38px; height: 38px; padding: 0; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.28); color: #fbbf24; font-size: 0; }
    .status-line { position: relative; display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; margin: 18px 0 16px; padding: 14px 2px 0; }
    .status-line::before { content: ''; position: absolute; left: 8%; right: 8%; top: 21px; height: 2px; border-radius: 999px; background: linear-gradient(90deg, #fbbf24, #38bdf8, #c084fc, #22c55e); opacity: 0.22; }
    .status-step { position: relative; min-height: 38px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; text-align: center; }
    .status-step span { position: relative; z-index: 1; width: 14px; height: 14px; border-radius: 999px; display: block; background: #18181b; border: 2px solid #3f3f46; box-shadow: 0 0 0 5px #101012; transition: 0.25s ease; }
    .status-step.done span { background: var(--line-color); border-color: var(--line-color); box-shadow: 0 0 0 5px #101012, 0 0 18px var(--line-color); }
    .status-step.active span { transform: scale(1.25); }
    .status-step strong { display: block; margin-top: 10px; color: #71717a; font-size: 0.45rem; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 950; }
    .status-step.done strong { color: white; }
    .status-step:nth-child(1) { --line-color: #fbbf24; }
    .status-step:nth-child(2) { --line-color: #fb923c; }
    .status-step:nth-child(3) { --line-color: #38bdf8; }
    .status-step:nth-child(4) { --line-color: #c084fc; }
    .status-step:nth-child(5) { --line-color: #22c55e; }
    .compact-finance { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; margin-bottom: 10px; }
    .compact-finance div { min-width: 0; padding: 9px; border-radius: 12px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.055); }
    .compact-finance span { display: block; color: #71717a; font-size: 0.44rem; font-weight: 950; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 5px; }
    .compact-finance strong { display: block; color: white; font-family: monospace; font-size: 0.66rem; font-weight: 950; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .items-column { display: grid; gap: 8px; }
    .order-item { display: grid; grid-template-columns: 42px minmax(0, 1fr) auto; gap: 9px; align-items: center; padding: 8px; border-radius: 14px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.055); min-width: 0; }
    .order-item img, .image-fallback { width: 42px; height: 42px; border-radius: 11px; object-fit: cover; background: #09090b; display: flex; align-items: center; justify-content: center; color: #71717a; }
    .order-item span { display: block; color: #71717a; font-size: 0.45rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.12em; }
    .order-item strong { display: block; color: white; font-size: 0.74rem; font-weight: 950; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .order-item p { color: #a1a1aa; font-size: 0.62rem; font-weight: 800; }
    .order-item em { justify-self: end; border-radius: 999px; padding: 5px 8px; font-size: 0.48rem; font-weight: 950; font-style: normal; text-transform: uppercase; white-space: nowrap; }
    .status-preparation { background: rgba(251,191,36,0.12); color: #fbbf24; }
    .status-emballee { background: rgba(14,165,233,0.12); color: #38bdf8; }
    .status-expedition { background: rgba(168,85,247,0.14); color: #c084fc; }
    .status-livree { background: rgba(34,197,94,0.12); color: #4ade80; }
    .status-annulee { background: rgba(239,68,68,0.14); color: #f87171; }
    .order-panel { border-radius: 20px; padding: 16px; }
    .ticket-total { padding: 18px; border-radius: 18px; background: #fbbf24; color: #050506; margin-bottom: 12px; }
    .ticket-total span { color: rgba(0,0,0,0.52); }
    .ticket-total strong { display: block; margin-top: 7px; font-size: 1.5rem; font-family: monospace; }
    .money-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .money-row strong { font-family: monospace; color: white; }
    .money-row.promo strong { color: #4ade80; }
    .delivery-box { margin-top: 10px; padding: 10px; border-radius: 13px; background: rgba(255,255,255,0.035); }
    .delivery-box strong { display: block; margin: 6px 0 3px; font-size: 0.76rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .delivery-box p, .delivery-box small { display: block; color: #8a8a93; font-size: 0.62rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .more-items { color: #fbbf24; font-size: 0.56rem; font-weight: 950; letter-spacing: 0.12em; text-transform: uppercase; padding: 8px; border-radius: 12px; background: rgba(251,191,36,0.07); border: 1px solid rgba(251,191,36,0.14); }
    .empty-state { position: relative; min-height: 360px; margin-top: 32px; border-radius: 26px; border: 1px dashed rgba(255,255,255,0.12); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #a1a1aa; text-align: center; }
    .empty-state a { color: #fbbf24; font-weight: 900; text-transform: uppercase; font-size: 0.72rem; }
    @media (max-width: 1280px) { .orders-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 980px) { .orders-hero { grid-template-columns: 1fr; } .hero-ledger { grid-template-columns: 1fr; } .status-line { overflow-x: auto; grid-template-columns: repeat(5, 82px); } }
    @media (max-width: 760px) { .orders-grid { grid-template-columns: 1fr; } }
    @media (max-width: 620px) { .order-top, .order-item { grid-template-columns: 1fr; } .order-item em { justify-self: start; } }
  `]
})
export class ClientOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  orders = signal<ClientOrder[]>([]);
  loading = signal(true);
  steps = [
    { key: 'PAYEE', label: 'Payée', index: '01' },
    { key: 'PREPARATION', label: 'Préparation', index: '02' },
    { key: 'EMBALLEE', label: 'Emballée', index: '03' },
    { key: 'EXPEDITION', label: 'Expédition', index: '04' },
    { key: 'LIVREE', label: 'Livrée', index: '05' }
  ];
  totalSpent = computed(() => this.orders().reduce((sum, order) => sum + Number(order.total || 0), 0));
  totalItems = computed(() => this.orders().reduce((sum, order) => sum + order.items.reduce((lineSum, item) => lineSum + Number(item.quantity || 0), 0), 0));

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: orders => { this.orders.set(orders); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  currentStep(order: ClientOrder): string {
    const statuses = order.items.map(item => item.fulfillmentStatus || 'PREPARATION');
    if (statuses.every(status => status === 'LIVREE')) return 'LIVREE';
    if (statuses.some(status => status === 'EXPEDITION')) return 'EXPEDITION';
    if (statuses.some(status => status === 'EMBALLEE')) return 'EMBALLEE';
    if (statuses.some(status => status === 'PREPARATION')) return 'PREPARATION';
    return 'PAYEE';
  }

  isStepDone(order: ClientOrder, key: string): boolean {
    return this.steps.findIndex(step => step.key === key) <= this.steps.findIndex(step => step.key === this.currentStep(order));
  }

  statusLabel(status: string): string {
    return ({ PREPARATION: 'Préparation', EMBALLEE: 'Emballée', EXPEDITION: 'Expédition', LIVREE: 'Livrée', ANNULEE: 'Annulée', PAYEE: 'Payée' } as any)[status] || status;
  }

  statusClass(status: string): string {
    return `status-${String(status || 'PREPARATION').toLowerCase()}`;
  }

  shippingLabel(value: number): string {
    return Number(value || 0) > 0 ? `${Number(value).toFixed(2)} MAD` : 'Gratuite';
  }

  downloadInvoice(order: ClientOrder) {
    const blob = new Blob([this.createInvoicePdf(order)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facture-${order.orderNumber}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private createInvoicePdf(order: ClientOrder): ArrayBuffer {
    const pageWidth = 595;
    const pageHeight = 842;
    const commands: string[] = [];
    const text = (value: string, x: number, y: number, size = 10) => commands.push(`BT /F1 ${size} Tf ${x} ${y} Td (${this.pdfEscape(value)}) Tj ET`);
    const fill = (r: number, g: number, b: number) => commands.push(`${r} ${g} ${b} rg`);
    const rect = (x: number, y: number, w: number, h: number) => commands.push(`${x} ${y} ${w} ${h} re f`);
    const outline = (x: number, y: number, w: number, h: number) => commands.push(`${x} ${y} ${w} ${h} re S`);
    const stroke = (r: number, g: number, b: number) => commands.push(`${r} ${g} ${b} RG`);
    fill(0.04, 0.04, 0.05); rect(0, 0, pageWidth, pageHeight);
    fill(0.075, 0.075, 0.09); rect(30, 28, 535, 786);
    stroke(0.18, 0.18, 0.21); outline(30, 28, 535, 786);
    fill(0.98, 0.75, 0.14); rect(44, 782, 126, 5);
    fill(1, 1, 1); text('ISGAARTI STORE', 44, 746, 24);
    fill(0.98, 0.75, 0.14); text('FACTURE E-COMMERCE CERTIFIEE', 44, 724, 8);
    fill(0.55, 0.55, 0.6); text(`Reference: ${order.orderNumber}`, 368, 744, 9); text(`Emission: ${new Date().toLocaleDateString('fr-FR')}`, 368, 728, 9);
    fill(0.98, 0.75, 0.14); rect(368, 682, 152, 42);
    fill(0.03, 0.03, 0.035); text('TOTAL PAYE', 384, 706, 8); text(`${Number(order.total || 0).toFixed(2)} MAD`, 384, 690, 15);
    fill(0.98, 0.75, 0.14); text('IDENTITE CLIENT', 44, 650, 9); text('LIVRAISON', 318, 650, 9);
    fill(0.1, 0.1, 0.12); rect(44, 568, 238, 66); rect(318, 568, 202, 66);
    stroke(0.2, 0.2, 0.22); outline(44, 568, 238, 66); outline(318, 568, 202, 66);
    fill(1, 1, 1); text(order.clientName || 'Client ISGAARTI', 58, 612, 10); text(order.clientEmail || '-', 58, 592, 8);
    text(order.shippingAddress || '-', 332, 612, 8); text(`${order.shippingCity || '-'} / ${order.shippingCountry || '-'}`, 332, 594, 8); text(order.shippingPhone || '-', 332, 578, 8);
    fill(0.98, 0.75, 0.14); text('ARTICLES & STATUTS', 44, 532, 9);
    fill(0.18, 0.18, 0.205); rect(44, 505, 476, 24);
    fill(1, 1, 1); text('Produit', 58, 514, 8); text('Qté', 334, 514, 8); text('Prix', 382, 514, 8); text('Statut', 450, 514, 8);
    let y = 478;
    order.items.slice(0, 8).forEach((item, index) => {
      fill(index % 2 ? 0.085 : 0.105, index % 2 ? 0.085 : 0.105, index % 2 ? 0.105 : 0.125);
      rect(44, y - 8, 476, 28);
      fill(1, 1, 1); text(item.name || 'Produit', 58, y + 3, 8);
      fill(0.72, 0.72, 0.76); text(String(item.quantity || 0), 338, y, 8); text(`${Number(item.unitPrice || 0).toFixed(2)}`, 382, y, 8);
      fill(0.98, 0.75, 0.14); text(this.statusLabel(item.fulfillmentStatus), 450, y, 7);
      y -= 32;
    });
    fill(0.1, 0.1, 0.12); rect(318, 82, 202, 142);
    stroke(0.24, 0.24, 0.27); outline(318, 82, 202, 142);
    fill(0.98, 0.75, 0.14); text('SYNTHESE', 334, 200, 8);
    fill(0.72, 0.72, 0.76); text(`Sous-total: ${Number(order.subtotal || 0).toFixed(2)} MAD`, 334, 176, 9); text(`Livraison: ${Number(order.shippingCost || 0).toFixed(2)} MAD`, 334, 156, 9); text(`Taxes: ${Number(order.taxAmount || 0).toFixed(2)} MAD`, 334, 136, 9); text(`Remise: ${Number(order.promoDiscount || 0).toFixed(2)} MAD`, 334, 116, 9);
    fill(0.98, 0.75, 0.14); text(`TOTAL: ${Number(order.total || 0).toFixed(2)} MAD`, 334, 94, 12);
    fill(0.55, 0.55, 0.6); text('ISGAARTI Store remercie votre confiance. Conservez cette facture pour votre suivi de commande.', 44, 42, 8);
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
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => pdf += `${String(offset).padStart(10, '0')} 00000 n \n`);
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const bytes = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i);
    return bytes.buffer;
  }

  private pdfEscape(value: string): string {
    return String(value || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').slice(0, 90);
  }
}
