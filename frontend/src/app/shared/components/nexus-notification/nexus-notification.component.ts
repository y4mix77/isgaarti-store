import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { NexusNotificationService } from '../../../core/services/nexus-notification.service';

@Component({
  selector: 'app-nexus-notification',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="nexus-notification-stack">
       @for (n of notifyService.notifications(); track n.id) {
          <div class="nexus-toast active">
             <div class="toast-indicator" [class.success]="n.type === 'success'" [class.error]="n.type === 'error'"></div>
             <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center">
                   <lucide-icon [name]="n.type === 'success' ? 'check' : 'alert-circle'" class="w-5 h-5 text-amber-500"></lucide-icon>
                </div>
                <div>
                   <p class="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-0.5">System Protocol</p>
                   <p class="text-xs font-bold text-white tracking-tight">{{ n.msg }}</p>
                </div>
             </div>
          </div>
       }
    </div>
  `,
  styles: [`
    .nexus-notification-stack {
      position: fixed;
      bottom: 32px;
      right: 32px;
      z-index: 100000;
      display: flex;
      flex-direction: column-reverse;
      gap: 12px;
      pointer-events: none;
    }

    .nexus-toast {
      position: relative;
      background: rgba(12, 12, 14, 0.95);
      backdrop-filter: blur(40px);
      border: 1px solid rgba(255,255,255,0.06);
      padding: 18px 24px;
      border-radius: 20px;
      box-shadow: 0 40px 100px rgba(0,0,0,0.8);
      min-width: 320px;
      pointer-events: auto;
      transform: translateX(120%);
      animation: toast-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes toast-in-right {
      to { transform: translateX(0); }
    }

    .toast-indicator {
      position: absolute;
      left: 0;
      top: 25%;
      bottom: 25%;
      width: 4px;
      border-radius: 0 4px 4px 0;
    }

    .toast-indicator.success { background: #fbbf24; box-shadow: 0 0 20px rgba(251,191,36,0.6); }
    .toast-indicator.error { background: #ef4444; box-shadow: 0 0 20px rgba(239,68,68,0.6); }
  `]
})
export class NexusNotificationComponent {
  notifyService = inject(NexusNotificationService);
}
