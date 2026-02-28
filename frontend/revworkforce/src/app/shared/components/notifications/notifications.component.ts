import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications = signal<any[]>([]);
  isLoading = signal(true);

  constructor(
    private notificationService: NotificationService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.notificationService.getMyNotifications().subscribe({
      next: (data) => {
        this.notifications.set(Array.isArray(data) ? data : []);
        this.isLoading.set(false);
      },
      error: () => {
        this.notifications.set([]);
        this.isLoading.set(false);
      }
    });
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe({
      next: () => this.notifications.update(list => list.map(n => n.id === id ? {...n, isRead: true} : n)),
      error: () => {}
    });
  }

  // FIXED: Backend has no /notifications/read-all endpoint — mark all read locally
  markAllAsRead() {
    const unread = this.notifications().filter(n => !n.isRead);
    let completed = 0;
    if (unread.length === 0) return;

    unread.forEach(n => {
      this.notificationService.markAsRead(n.id).subscribe({
        next: () => {
          completed++;
          this.notifications.update(list => list.map(x => x.id === n.id ? {...x, isRead: true} : x));
        },
        error: () => {
          // Mark locally anyway
          this.notifications.update(list => list.map(x => x.id === n.id ? {...x, isRead: true} : x));
        }
      });
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getRole(): 'EMPLOYEE' | 'MANAGER' | 'ADMIN' {
    const role = this.auth.getRole();
    return (role === 'EMPLOYEE' || role === 'MANAGER' || role === 'ADMIN') ? role : 'EMPLOYEE';
  }
}
