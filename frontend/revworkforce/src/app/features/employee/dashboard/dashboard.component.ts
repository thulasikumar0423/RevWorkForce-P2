import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { LeaveService } from '../../../core/services/leave.service';
import { PerformanceService } from '../../../core/services/performance.service';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeaveBalance, LeaveApplication } from '../../../core/models/leave.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  leaveBalances = signal<LeaveBalance[]>([]);
  recentLeaves = signal<LeaveApplication[]>([]);
  isLoading = signal(true);
  today = new Date();
  goals = signal<any[]>([]);
  notifications = signal<any[]>([]);
  announcements = signal<any[]>([]);
  reviewsCount = signal(0);
  showSearch = signal(false);
  showNotifications = signal(false);

  leaveColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  constructor(
    private leaveService: LeaveService,
    private performanceService: PerformanceService,
    private announcementService: AnnouncementService,
    public auth: AuthService
  ) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.leaveService.getMyBalances().subscribe({
      next: (data) => this.leaveBalances.set(Array.isArray(data) ? data : []),
      error: () => this.leaveBalances.set([])
    });
    this.leaveService.getMyLeaves().subscribe({
      next: (data) => { this.recentLeaves.set(Array.isArray(data) ? data.slice(0, 5) : []); this.isLoading.set(false); },
      error: () => { this.recentLeaves.set([]); this.isLoading.set(false); }
    });
    this.performanceService.getMyGoals().subscribe({
      next: (data) => this.goals.set(Array.isArray(data) ? data.slice(0, 3) : []),
      error: () => this.goals.set([])
    });
    this.performanceService.getMyReviews().subscribe({
      next: (data) => this.reviewsCount.set(Array.isArray(data) ? data.length : 0),
      error: () => this.reviewsCount.set(0)
    });
    this.announcementService.getAllAnnouncements().subscribe({
      next: (data) => this.announcements.set(Array.isArray(data) ? data.slice(0, 3) : []),
      error: () => this.announcements.set([])
    });
  }

  cancelLeave(id: number) {
    if (confirm('Cancel this leave application?')) {
      this.leaveService.cancelLeave(id).subscribe({
        next: () => this.recentLeaves.update(l => l.filter(x => x.id !== id)),
        error: () => alert('Failed to cancel. Try again.')
      });
    }
  }

  // Use correct backend field: totalQuota (not total)
  getTotalBalance(): number {
    return this.leaveBalances().reduce((s, b) => s + (b.remaining ?? 0), 0);
  }
  getPendingCount(): number {
    return this.recentLeaves().filter(l => l.status === 'PENDING').length;
  }
  getBarWidth(b: LeaveBalance): string {
    return (b.totalQuota ?? 0) > 0 ? `${((b.remaining ?? 0) / (b.totalQuota ?? 1)) * 100}%` : '0%';
  }
  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  toggleSearch() { this.showSearch.update(v => !v); }
  toggleNotifications() { this.showNotifications.update(v => !v); }
}
