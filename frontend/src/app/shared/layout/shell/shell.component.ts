import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DockComponent } from '../dock/dock.component';
import { NexusNotificationComponent } from '../../components/nexus-notification/nexus-notification.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, DockComponent, NexusNotificationComponent],
  template: `
    <div class="relative min-h-screen text-white selection:bg-amber-500/30 selection:text-amber-200">
      <!-- Main Content Area -->
      <main [class.pb-24]="!usesFlushFooter()" [class.pb-0]="usesFlushFooter()">
        <router-outlet></router-outlet>
      </main>

      <!-- macOS Dock -->
      <app-dock></app-dock>

      <!-- Global Notifications -->
      <app-nexus-notification></app-nexus-notification>
    </div>
  `
})
export class ShellComponent {
  constructor(private router: Router) {}

  usesFlushFooter(): boolean {
    const url = this.router.url.split('?')[0].split('#')[0];
    return url === '/produits' || url.startsWith('/produits/') || url === '/panier';
  }
}
