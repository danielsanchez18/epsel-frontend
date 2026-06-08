import { Injectable, inject } from '@angular/core';
import { AppNotification } from '@core/interfaces/notifications/notification.interface';
import { DashboardService } from '@services/dashboard/dashboard.service';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  private dashboardService = inject(DashboardService);
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  public unreadCount$: Observable<number> = this.notifications$.pipe(
    map(notifs => notifs.filter(n => !n.read).length)
  );

  constructor() {
    this.startPolling();
  }

  private startPolling() {
    // Consultar cada 15 segundos para dar la sensación de tiempo real
    timer(0, 15000).pipe(
      switchMap(() => this.dashboardService.getDashboard())
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const activities = res.data.recentActivities || [];
          const readIds = this.getReadIds();
          
          const newNotifs: AppNotification[] = activities.map(act => {
            // Generar un ID único basado en la fecha y la acción
            const id = btoa(encodeURIComponent(act.date + act.action)).substring(0, 15);
            
            // Determinar tipo según la acción para pintar el icono
            let type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO';
            const actionLower = act.action.toLowerCase();
            if (actionLower.includes('pago')) type = 'SUCCESS';
            else if (actionLower.includes('cread')) type = 'SUCCESS';
            else if (actionLower.includes('actualiz')) type = 'INFO';
            else if (actionLower.includes('elimin') || actionLower.includes('corte')) type = 'ERROR';
            else if (actionLower.includes('suspend')) type = 'WARNING';

            return {
              id,
              title: act.action,
              message: act.description,
              createdAt: act.date,
              read: readIds.includes(id),
              type
            };
          });

          this.notificationsSubject.next(newNotifs);
        }
      },
      error: (err) => console.error('Error fetching dashboard activities for notifications', err)
    });
  }

  private getReadIds(): string[] {
    const stored = localStorage.getItem('readNotifications');
    return stored ? JSON.parse(stored) : [];
  }

  private addReadId(id: string) {
    const readIds = this.getReadIds();
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem('readNotifications', JSON.stringify(readIds));
    }
  }

  getNotifications(): Observable<AppNotification[]> {
    return this.notifications$;
  }

  markAsRead(id: string): void {
    this.addReadId(id);
    const updated = this.notificationsSubject.value.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updated);
  }

  markAllAsRead(): void {
    const current = this.notificationsSubject.value;
    current.forEach(n => this.addReadId(n.id));
    const updated = current.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
  }
}
