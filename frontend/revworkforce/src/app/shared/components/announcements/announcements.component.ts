import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent implements OnInit {
  announcements = signal<any[]>([]);
  isLoading = signal(true);

  constructor(
    private announcementService: AnnouncementService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.announcementService.getAllAnnouncements().subscribe({
      next: (data) => {
        this.announcements.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.announcements.set([
          { id: 1, title: 'Holi Holiday – 14 Mar 2026', description: 'Office closed for Holi festival.', createdAt: 'Feb 20, 2026', type: 'WARNING' },
          { id: 2, title: 'Q1 Performance Reviews Open', description: 'Submit your self-assessment by March 31.', createdAt: 'Feb 15, 2026', type: 'INFO' },
          { id: 3, title: 'Employee of the Month', description: 'Congratulations to Priya Sharma!', createdAt: 'Feb 10, 2026', type: 'SUCCESS' }
        ]);
        this.isLoading.set(false);
      }
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

  getIcon(type: string): string {
    const icons: any = {
      'INFO': 'bi-info-circle',
      'WARNING': 'bi-calendar-event',
      'SUCCESS': 'bi-trophy'
    };
    return icons[type] || 'bi-megaphone';
  }

  getTypeClass(type: string): string {
    const classes: any = {
      'INFO': 'info',
      'WARNING': 'warn',
      'SUCCESS': 'success'
    };
    return classes[type] || 'info';
  }
}
