import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  template: `
    <main class="auth-page">
      <div class="auth-grid-bg"></div>
      <div class="auth-light"></div>

      @if (successMsg()) {
        <div class="auth-toast success">
          <lucide-icon name="check-circle" class="w-5 h-5"></lucide-icon>
          <div>
            <span>Compte prêt</span>
            <p>{{ successMsg() }}</p>
          </div>
        </div>
      }

      @if (errorMsg()) {
        <div class="auth-toast">
          <lucide-icon name="circle-x" class="w-5 h-5"></lucide-icon>
          <div>
            <span>Inscription refusée</span>
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
          <h1>Entrez vos informations</h1>
          <p>
            Créez votre compte pour acheter plus vite, suivre vos livraisons, récupérer vos factures
            ou ouvrir une vitrine vendeur connectée au marketplace.
          </p>

          <div class="commerce-ribbon">
            <div>
              <lucide-icon name="user-check" class="w-5 h-5"></lucide-icon>
              <span>Compte client</span>
            </div>
            <div>
              <lucide-icon name="shopping-bag" class="w-5 h-5"></lucide-icon>
              <span>Vitrine vendeur</span>
            </div>
            <div>
              <lucide-icon name="shield-check" class="w-5 h-5"></lucide-icon>
              <span>Achat sécurisé</span>
            </div>
          </div>

          <div class="retail-pass">
            <div class="pass-head">
              <span>Retail pass</span>
              <strong>{{ registerForm.get('role')?.value === 'ROLE_VENDEUR' ? 'SELLER' : 'CLIENT' }}</strong>
            </div>
            <div class="pass-body">
              <div><span>Commandes</span><em>Suivi complet</em></div>
              <div><span>Factures</span><em>PDF premium</em></div>
              <div><span>Promotions</span><em>Codes produit</em></div>
            </div>
          </div>
        </div>

        <div class="auth-card">
          <div class="card-head">
            <div>
              <span>Ouverture de compte</span>
              <h2>Inscription</h2>
            </div>
            <lucide-icon name="user-plus" class="w-7 h-7"></lucide-icon>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="field-grid">
              <label class="field-shell">
                <span>Nom complet</span>
                <div>
                  <lucide-icon name="user" class="w-5 h-5"></lucide-icon>
                  <input type="text" formControlName="name" placeholder="Votre nom">
                </div>
              </label>

              <label class="field-shell">
                <span>Adresse email</span>
                <div>
                  <lucide-icon name="mail" class="w-5 h-5"></lucide-icon>
                  <input type="email" formControlName="email" placeholder="client@isgaarti.com">
                </div>
              </label>
            </div>

            <label class="field-shell">
              <span>Mot de passe</span>
              <div>
                <lucide-icon name="lock" class="w-5 h-5"></lucide-icon>
                <input type="password" formControlName="password" placeholder="Minimum 6 caractères">
              </div>
            </label>

            <div class="role-panel">
              <span>Type de compte</span>
              <div>
                <button type="button"
                  (click)="registerForm.patchValue({role: 'ROLE_CLIENT'})"
                  [class.active]="registerForm.get('role')?.value === 'ROLE_CLIENT'">
                  <lucide-icon name="shopping-cart" class="w-4 h-4"></lucide-icon>
                  <strong>Client</strong>
                  <em>Achats, panier, factures</em>
                </button>
                <button type="button"
                  (click)="registerForm.patchValue({role: 'ROLE_VENDEUR'})"
                  [class.active]="registerForm.get('role')?.value === 'ROLE_VENDEUR'">
                  <lucide-icon name="package-check" class="w-4 h-4"></lucide-icon>
                  <strong>Vendeur</strong>
                  <em>Produits, stock, commandes</em>
                </button>
              </div>
            </div>

            <button type="submit" [disabled]="registerForm.invalid || isLoading()" class="auth-action">
              <span>
                @if (isLoading()) { Création de votre compte... }
                @else { Créer mon accès commerce }
              </span>
              <lucide-icon name="arrow-right" class="w-5 h-5"></lucide-icon>
            </button>

            <div class="auth-switch">
              <span>Vous avez déjà un compte ?</span>
              <a routerLink="/login">Se connecter</a>
            </div>
          </form>
        </div>
      </section>
    </main>

    <style>
      .auth-page { position: relative; min-height: 100vh; overflow: hidden; display: grid; place-items: center; padding: 42px clamp(18px,4vw,72px); background: #050506; color: white; font-family: Inter, sans-serif; }
      .auth-grid-bg { position: fixed; inset: 0; opacity: 0.05; background-image: linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px); background-size: 84px 84px; mask-image: radial-gradient(circle at center, black, transparent 88%); pointer-events: none; }
      .auth-light { position: fixed; inset: 0; pointer-events: none; background: radial-gradient(circle at 18% 18%, rgba(251,191,36,0.14), transparent 30%), radial-gradient(circle at 80% 18%, rgba(56,189,248,0.10), transparent 28%), radial-gradient(circle at 70% 88%, rgba(255,255,255,0.05), transparent 24%); }
      .auth-shell { position: relative; z-index: 1; width: min(1280px, 100%); display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(520px, 0.96fr); align-items: center; gap: clamp(28px,5vw,76px); }
      .brand-mark { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 22px; }
      .brand-mark span { width: 9px; height: 9px; border-radius: 999px; background: #fbbf24; box-shadow: 0 0 18px rgba(251,191,36,0.8); }
      .brand-mark strong, .card-head span, .role-panel > span { color: #fbbf24; font-size: 0.58rem; font-weight: 950; letter-spacing: 0.32em; text-transform: uppercase; }
      .auth-hero h1 { max-width: 640px; font-size: clamp(2.8rem, 4.8vw, 5.2rem); line-height: 0.98; font-weight: 950; letter-spacing: 0; background: linear-gradient(108deg, #fff, #fbbf24 62%, #7dd3fc); -webkit-background-clip: text; background-clip: text; color: transparent; }
      .auth-hero p { max-width: 610px; margin-top: 24px; color: #a1a1aa; font-size: clamp(1rem,1.2vw,1.15rem); font-weight: 750; line-height: 1.75; }
      .commerce-ribbon { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
      .commerce-ribbon div { min-height: 46px; padding: 0 14px; border-radius: 999px; display: inline-flex; align-items: center; gap: 9px; color: white; background: rgba(255,255,255,0.055); border: 1px solid rgba(255,255,255,0.09); }
      .commerce-ribbon lucide-icon { color: #fbbf24; }
      .commerce-ribbon span { color: #d4d4d8; font-size: 0.64rem; font-weight: 950; letter-spacing: 0.12em; text-transform: uppercase; }
      .retail-pass { max-width: 530px; margin-top: 34px; padding: 16px; border-radius: 22px; background: rgba(18,18,20,0.72); border: 1px solid rgba(255,255,255,0.08); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 30px 90px rgba(0,0,0,0.35); }
      .pass-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 4px 12px; border-bottom: 1px solid rgba(255,255,255,0.07); }
      .pass-head span, .pass-body span { color: #71717a; font-size: 0.58rem; font-weight: 950; letter-spacing: 0.16em; text-transform: uppercase; }
      .pass-head strong { color: #fbbf24; font-family: monospace; font-size: 1rem; font-weight: 950; }
      .pass-body { display: grid; gap: 8px; margin-top: 10px; }
      .pass-body div { min-height: 40px; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 0 12px; border-radius: 13px; background: rgba(0,0,0,0.24); border: 1px solid rgba(255,255,255,0.06); }
      .pass-body em { color: #d4d4d8; font-style: normal; font-size: 0.72rem; font-weight: 850; }
      .auth-card { position: relative; min-height: 610px; padding: clamp(28px,3.6vw,48px); border-radius: 30px; background: linear-gradient(145deg, rgba(24,24,26,0.94), rgba(7,7,8,0.98)); border: 1px solid rgba(255,255,255,0.11); box-shadow: 0 60px 160px rgba(0,0,0,0.64), 0 0 0 1px rgba(251,191,36,0.045), inset 0 1px 0 rgba(255,255,255,0.1); overflow: hidden; }
      .auth-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(251,191,36,0.16), transparent 32%, rgba(56,189,248,0.1)); pointer-events: none; }
      .auth-card::after { content: ''; position: absolute; left: 28px; right: 28px; top: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(251,191,36,0.85), rgba(125,211,252,0.45), transparent); }
      .card-head, .auth-form { position: relative; z-index: 1; }
      .card-head { display: flex; justify-content: space-between; align-items: start; gap: 18px; margin-bottom: 32px; }
      .card-head h2 { margin-top: 8px; color: white; font-size: clamp(2rem,3.8vw,3.2rem); line-height: 0.95; font-weight: 950; }
      .card-head lucide-icon { color: #fbbf24; }
      .auth-form { display: grid; gap: 19px; }
      .field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
      .field-shell span { display: block; margin-bottom: 9px; color: #71717a; font-size: 0.58rem; font-weight: 950; letter-spacing: 0.18em; text-transform: uppercase; }
      .field-shell div { min-height: 62px; display: flex; align-items: center; gap: 13px; padding: 0 18px; border-radius: 17px; background: rgba(0,0,0,0.46); border: 1px solid rgba(255,255,255,0.09); transition: 0.2s ease; }
      .field-shell:focus-within div { border-color: rgba(251,191,36,0.52); box-shadow: 0 0 0 4px rgba(251,191,36,0.08); }
      .field-shell lucide-icon { color: #71717a; }
      .field-shell input { flex: 1; min-width: 0; background: transparent; border: 0; outline: 0; color: white; font-weight: 850; }
      .field-shell input::placeholder { color: rgba(255,255,255,0.18); }
      .role-panel > span { display: block; margin-bottom: 10px; color: #71717a; }
      .role-panel > div { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .role-panel button { min-height: 104px; padding: 16px; border-radius: 18px; display: grid; gap: 5px; justify-items: start; text-align: left; background: rgba(0,0,0,0.36); border: 1px solid rgba(255,255,255,0.09); color: white; transition: 0.22s ease; }
      .role-panel button lucide-icon { color: #71717a; }
      .role-panel button strong { font-size: 0.76rem; font-weight: 950; letter-spacing: 0.1em; text-transform: uppercase; }
      .role-panel button em { color: #71717a; font-size: 0.68rem; font-style: normal; font-weight: 800; }
      .role-panel button.active { border-color: rgba(251,191,36,0.5); background: rgba(251,191,36,0.12); box-shadow: 0 0 0 4px rgba(251,191,36,0.06); }
      .role-panel button.active lucide-icon, .role-panel button.active em { color: #fbbf24; }
      .auth-action { min-height: 68px; margin-top: 8px; padding: 0 24px; border-radius: 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; background: white; color: #050506; font-size: 0.78rem; font-weight: 950; letter-spacing: 0.14em; text-transform: uppercase; transition: 0.22s ease; }
      .auth-action:hover:not(:disabled) { background: #fbbf24; transform: translateY(-3px); box-shadow: 0 24px 70px rgba(251,191,36,0.24); }
      .auth-action:disabled { opacity: 0.35; cursor: not-allowed; }
      .auth-switch { padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.07); text-align: center; }
      .auth-switch span { color: #71717a; font-size: 0.66rem; font-weight: 850; }
      .auth-switch a { margin-left: 8px; color: #fbbf24; font-size: 0.66rem; font-weight: 950; letter-spacing: 0.08em; text-transform: uppercase; }
      .auth-toast { position: fixed; right: 28px; bottom: 28px; z-index: 20; width: min(360px, calc(100vw - 36px)); display: flex; gap: 14px; padding: 16px; border-radius: 16px; background: rgba(18,18,20,0.96); border: 1px solid rgba(239,68,68,0.38); box-shadow: 0 24px 70px rgba(0,0,0,0.5); color: #ef4444; }
      .auth-toast.success { color: #22c55e; border-color: rgba(34,197,94,0.38); }
      .auth-toast span { color: white; font-size: 0.62rem; font-weight: 950; letter-spacing: 0.16em; text-transform: uppercase; }
      .auth-toast p { margin-top: 4px; color: #d4d4d8; font-size: 0.78rem; font-weight: 800; }
      @media (max-width: 1020px) { .auth-shell { grid-template-columns: 1fr; } .retail-pass { max-width: none; } }
      @media (max-width: 620px) { .auth-page { padding: 22px 16px; place-items: start center; } .auth-hero h1 { font-size: clamp(2.45rem,12vw,3.6rem); } .commerce-ribbon div, .field-grid, .role-panel > div { grid-template-columns: 1fr; width: 100%; } .commerce-ribbon div { justify-content: center; } .auth-card { border-radius: 22px; } .auth-action { letter-spacing: 0.08em; } }
    </style>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['ROLE_CLIENT', Validators.required]
  });

  isLoading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    const credentials = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        if (this.registerForm.value.role === 'ROLE_VENDEUR') {
          this.isLoading.set(false);
          this.successMsg.set("Vitrine vendeur créée. L'équipe valide votre accès.");
          setTimeout(() => {
            this.successMsg.set('');
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.authService.login(credentials).subscribe({
            next: () => {
              this.isLoading.set(false);
              this.successMsg.set('Compte client prêt. Bienvenue sur ISGAARTI.');
              setTimeout(() => {
                this.successMsg.set('');
                this.router.navigate(['/']);
              }, 1500);
            },
            error: () => {
              this.isLoading.set(false);
              this.router.navigate(['/login']);
            }
          });
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 400 && err.error && typeof err.error === 'string') {
          this.errorMsg.set(err.error);
        } else if (err.status === 0) {
          this.errorMsg.set('Connexion au serveur impossible. Vérifiez le backend.');
        } else {
          this.errorMsg.set(`Erreur ${err.status}: ${err.message || 'Échec de création'}`);
        }
        console.error('Registration error:', err);
        setTimeout(() => this.errorMsg.set(''), 2200);
      }
    });
  }
}
