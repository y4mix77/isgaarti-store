import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  template: `
    <main class="auth-page">
      <div class="auth-grid-bg"></div>
      <div class="auth-light"></div>

      @if (errorMsg()) {
        <div class="auth-toast">
          <lucide-icon name="circle-x" class="w-5 h-5"></lucide-icon>
          <div>
            <span>Accès refusé</span>
            <p>{{ errorMsg() }}</p>
          </div>
        </div>
      }

      <section class="auth-shell">
        <div class="auth-hero">
          <div class="brand-mark">
            <span></span>
            <strong>ISGAARTI Store</strong>
          </div>
          <h1>Votre espace commerce.</h1>
          <p>
            Connectez-vous pour retrouver votre panier, suivre vos commandes, télécharger vos factures
            et gérer vos opérations vendeur en toute sécurité.
          </p>

          <div class="commerce-ribbon">
            <div>
              <lucide-icon name="shopping-bag" class="w-5 h-5"></lucide-icon>
              <span>Panier client</span>
            </div>
            <div>
              <lucide-icon name="package-check" class="w-5 h-5"></lucide-icon>
              <span>Suivi commande</span>
            </div>
            <div>
              <lucide-icon name="file-spreadsheet" class="w-5 h-5"></lucide-icon>
              <span>Factures</span>
            </div>
          </div>

          <div class="checkout-preview">
            <div class="preview-top">
              <span>Secure retail access</span>
              <strong>ISGAARTI</strong>
            </div>
            <div class="preview-line active"><span>Identité</span><em>Vérifiée</em></div>
            <div class="preview-line"><span>Commandes</span><em>Synchronisées</em></div>
            <div class="preview-line"><span>Paiements</span><em>Protégés</em></div>
          </div>
        </div>

        <div class="auth-card">
          <div class="card-head">
            <div>
              <span>Espace sécurisé</span>
              <h2>Connexion</h2>
            </div>
            <lucide-icon name="shield-check" class="w-7 h-7"></lucide-icon>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
            <label class="field-shell">
              <span>Adresse email</span>
              <div>
                <lucide-icon name="mail" class="w-5 h-5"></lucide-icon>
                <input type="email" formControlName="email" placeholder="client@isgaarti.com">
              </div>
            </label>

            <label class="field-shell">
              <span>Mot de passe</span>
              <div>
                <lucide-icon name="lock" class="w-5 h-5"></lucide-icon>
                <input type="password" formControlName="password" placeholder="••••••••">
              </div>
            </label>

            <button type="submit" [disabled]="loginForm.invalid || isLoading()" class="auth-action">
              <span>
                @if (isLoading()) { Ouverture de votre espace... }
                @else { Accéder à mon espace }
              </span>
              <lucide-icon name="arrow-right" class="w-5 h-5"></lucide-icon>
            </button>

            <div class="auth-switch">
              <span>Nouveau sur ISGAARTI ?</span>
              <a routerLink="/register">Créer un compte commerce</a>
            </div>
          </form>
        </div>
      </section>
    </main>

    <style>
      .auth-page { position: relative; min-height: 100vh; overflow: hidden; display: grid; place-items: center; padding: 42px clamp(18px,4vw,72px); background: #050506; color: white; font-family: Inter, sans-serif; }
      .auth-grid-bg { position: fixed; inset: 0; opacity: 0.05; background-image: linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px); background-size: 84px 84px; mask-image: radial-gradient(circle at center, black, transparent 88%); pointer-events: none; }
      .auth-light { position: fixed; inset: 0; pointer-events: none; background: radial-gradient(circle at 18% 18%, rgba(251,191,36,0.14), transparent 30%), radial-gradient(circle at 80% 18%, rgba(56,189,248,0.10), transparent 28%), radial-gradient(circle at 70% 88%, rgba(255,255,255,0.05), transparent 24%); }
      .auth-shell { position: relative; z-index: 1; width: min(1240px, 100%); display: grid; grid-template-columns: minmax(0, 1fr) minmax(440px, 0.82fr); align-items: center; gap: clamp(28px,5vw,82px); }
      .brand-mark { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 22px; }
      .brand-mark span { width: 9px; height: 9px; border-radius: 999px; background: #fbbf24; box-shadow: 0 0 18px rgba(251,191,36,0.8); }
      .brand-mark strong, .card-head span { color: #fbbf24; font-size: 0.58rem; font-weight: 950; letter-spacing: 0.32em; text-transform: uppercase; }
      .auth-hero h1 { max-width: 640px; font-size: clamp(2.8rem, 4.8vw, 5.2rem); line-height: 0.98; font-weight: 950; letter-spacing: 0; background: linear-gradient(108deg, #fff, #fbbf24 62%, #7dd3fc); -webkit-background-clip: text; background-clip: text; color: transparent; }
      .auth-hero p { max-width: 610px; margin-top: 24px; color: #a1a1aa; font-size: clamp(1rem,1.2vw,1.15rem); font-weight: 750; line-height: 1.75; }
      .commerce-ribbon { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
      .commerce-ribbon div { min-height: 46px; padding: 0 14px; border-radius: 999px; display: inline-flex; align-items: center; gap: 9px; color: white; background: rgba(255,255,255,0.055); border: 1px solid rgba(255,255,255,0.09); }
      .commerce-ribbon lucide-icon { color: #fbbf24; }
      .commerce-ribbon span { color: #d4d4d8; font-size: 0.64rem; font-weight: 950; letter-spacing: 0.12em; text-transform: uppercase; }
      .checkout-preview { max-width: 520px; margin-top: 34px; padding: 16px; border-radius: 22px; background: rgba(18,18,20,0.72); border: 1px solid rgba(255,255,255,0.08); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 30px 90px rgba(0,0,0,0.35); }
      .preview-top, .preview-line { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
      .preview-top { padding: 0 4px 12px; border-bottom: 1px solid rgba(255,255,255,0.07); }
      .preview-top span, .preview-line span { color: #71717a; font-size: 0.58rem; font-weight: 950; letter-spacing: 0.16em; text-transform: uppercase; }
      .preview-top strong { color: white; font-size: 0.72rem; font-weight: 950; letter-spacing: 0.18em; }
      .preview-line { min-height: 42px; margin-top: 8px; padding: 0 12px; border-radius: 14px; background: rgba(0,0,0,0.24); border: 1px solid rgba(255,255,255,0.06); }
      .preview-line em { color: #a1a1aa; font-style: normal; font-family: monospace; font-weight: 950; font-size: 0.72rem; }
      .preview-line.active em { color: #fbbf24; }
      .auth-card { position: relative; min-height: 520px; padding: clamp(30px,4.6vw,54px); border-radius: 30px; background: linear-gradient(145deg, rgba(24,24,26,0.94), rgba(7,7,8,0.98)); border: 1px solid rgba(255,255,255,0.11); box-shadow: 0 60px 160px rgba(0,0,0,0.64), 0 0 0 1px rgba(251,191,36,0.045), inset 0 1px 0 rgba(255,255,255,0.1); overflow: hidden; }
      .auth-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(251,191,36,0.16), transparent 32%, rgba(56,189,248,0.1)); pointer-events: none; }
      .auth-card::after { content: ''; position: absolute; left: 28px; right: 28px; top: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(251,191,36,0.85), rgba(125,211,252,0.45), transparent); }
      .card-head, .auth-form { position: relative; z-index: 1; }
      .card-head { display: flex; justify-content: space-between; align-items: start; gap: 18px; margin-bottom: 38px; }
      .card-head h2 { margin-top: 8px; color: white; font-size: clamp(2rem,4vw,3.4rem); line-height: 0.95; font-weight: 950; }
      .card-head lucide-icon { color: #fbbf24; }
      .auth-form { display: grid; gap: 21px; }
      .field-shell span { display: block; margin-bottom: 9px; color: #71717a; font-size: 0.58rem; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; }
      .field-shell div { min-height: 64px; display: flex; align-items: center; gap: 14px; padding: 0 20px; border-radius: 17px; background: rgba(0,0,0,0.46); border: 1px solid rgba(255,255,255,0.09); transition: 0.2s ease; }
      .field-shell:focus-within div { border-color: rgba(251,191,36,0.52); box-shadow: 0 0 0 4px rgba(251,191,36,0.08); }
      .field-shell lucide-icon { color: #71717a; }
      .field-shell input { flex: 1; min-width: 0; background: transparent; border: 0; outline: 0; color: white; font-weight: 850; }
      .field-shell input::placeholder { color: rgba(255,255,255,0.18); }
      .auth-action { min-height: 68px; margin-top: 10px; padding: 0 24px; border-radius: 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; background: white; color: #050506; font-size: 0.78rem; font-weight: 950; letter-spacing: 0.14em; text-transform: uppercase; transition: 0.22s ease; }
      .auth-action:hover:not(:disabled) { background: #fbbf24; transform: translateY(-3px); box-shadow: 0 24px 70px rgba(251,191,36,0.24); }
      .auth-action:disabled { opacity: 0.35; cursor: not-allowed; }
      .auth-switch { padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.07); text-align: center; }
      .auth-switch span { color: #71717a; font-size: 0.66rem; font-weight: 850; }
      .auth-switch a { margin-left: 8px; color: #fbbf24; font-size: 0.66rem; font-weight: 950; letter-spacing: 0.08em; text-transform: uppercase; }
      .auth-toast { position: fixed; right: 28px; bottom: 28px; z-index: 20; width: min(360px, calc(100vw - 36px)); display: flex; gap: 14px; padding: 16px; border-radius: 16px; background: rgba(18,18,20,0.96); border: 1px solid rgba(239,68,68,0.38); box-shadow: 0 24px 70px rgba(0,0,0,0.5); color: #ef4444; }
      .auth-toast span { color: white; font-size: 0.62rem; font-weight: 950; letter-spacing: 0.16em; text-transform: uppercase; }
      .auth-toast p { margin-top: 4px; color: #d4d4d8; font-size: 0.78rem; font-weight: 800; }
      @media (max-width: 980px) { .auth-shell { grid-template-columns: 1fr; } .checkout-preview { max-width: none; } }
      @media (max-width: 620px) { .auth-page { padding: 22px 16px; place-items: start center; } .auth-hero h1 { font-size: clamp(2.45rem,12vw,3.6rem); } .commerce-ribbon div { width: 100%; justify-content: center; } .auth-card { border-radius: 22px; } .auth-action { letter-spacing: 0.08em; } }
    </style>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isLoading = signal(false);
  errorMsg = signal('');

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMsg.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        if (this.authService.hasRole('ROLE_ADMIN')) {
          this.router.navigate(['/admin']);
        } else if (this.authService.hasRole('ROLE_VENDEUR')) {
          this.router.navigate(['/vendeur']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.errorMsg.set('Identifiants invalides. Veuillez réessayer.');
        } else if (err.status === 0) {
          this.errorMsg.set('Connexion au serveur impossible. Vérifiez le backend.');
        } else if (err.status === 403) {
          this.errorMsg.set(err.error || 'Votre compte vendeur est en attente d’approbation.');
        } else {
          this.errorMsg.set(`Erreur ${err.status}: ${err.message || 'Échec de connexion'}`);
        }
        console.error('Login error:', err);
        setTimeout(() => this.errorMsg.set(''), 2200);
      }
    });
  }
}
