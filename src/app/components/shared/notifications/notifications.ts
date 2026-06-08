import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideCheckCheck, LucideInfo, LucideAlertTriangle, LucideCheckCircle, LucideAlertCircle } from '@lucide/angular';
import { NotificationService } from '@core/services/notifications/notification.service';
import { AppNotification } from '@core/interfaces/notifications/notification.interface';

@Component({
  selector: 'component-shared-notifications',
  imports: [CommonModule, LucideCheckCheck, LucideInfo, LucideAlertTriangle, LucideCheckCircle, LucideAlertCircle],
  templateUrl: './notifications.html',
})
export class ComponentSharedNotifications implements OnInit {
  private notificationService = inject(NotificationService);

  notifications: AppNotification[] = [];
  filter: 'ALL' | 'UNREAD' | 'READ' = 'ALL';

  ngOnInit() {
    this.notificationService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
    });
  }

  get filteredNotifications() {
    if (this.filter === 'UNREAD') return this.notifications.filter(n => !n.read);
    if (this.filter === 'READ') return this.notifications.filter(n => n.read);
    return this.notifications;
  }

  setFilter(filter: 'ALL' | 'UNREAD' | 'READ') {
    this.filter = filter;
  }

  markAsRead(id: string) {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  getRelativeTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 0) return 'Hace unos instantes';

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hace unos instantes';
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 30) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
