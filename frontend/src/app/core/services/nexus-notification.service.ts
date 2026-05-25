import { Injectable, signal } from '@angular/core';

export interface NexusNotify {
  id: number;
  msg: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NexusNotificationService {
  notifications = signal<NexusNotify[]>([]);

  show(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    const id = Date.now();
    this.notifications.update(prev => [...prev, { id, msg, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      this.notifications.update(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string) { this.show(msg, 'error'); }
  info(msg: string) { this.show(msg, 'info'); }
}
