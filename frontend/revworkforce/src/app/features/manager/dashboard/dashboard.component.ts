import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { LeaveService } from '../../../core/services/leave.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { PerformanceService } from '../../../core/services/performance.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeaveApplication, LeaveBalance } from '../../../core/models/leave.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  pendingLeaves = signal<LeaveApplication[]>([]);
  teamMembers = signal<any[]>([]);
  reviews = signal<any[]>([]);
  myLeaveBalances = signal<LeaveBalance[]>([]);   // manager's own leave balances
  isLoading = signal(true);
  actionError = signal('');
  today = new Date();
  showSearch = signal(false);
  showNotifications = signal(false);

  weekDays: string[] = [];
  calData: { initials: string; name: string; color: string; days: string[] }[] = [];

  private readonly colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#ef4444', '#6b7280'];
  readonly balanceColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private performanceService: PerformanceService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.buildWeekDays();
    this.loadData();
  }

  buildWeekDays() {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    this.weekDays = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      this.weekDays.push(d.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + d.getDate());
    }
  }

  loadData() {
    this.isLoading.set(true);

    // Manager's own leave balances (since manager is also an employee)
    this.leaveService.getMyBalances().subscribe({
      next: d => this.myLeaveBalances.set(Array.isArray(d) ? d : []),
      error: () => this.myLeaveBalances.set([])
    });

    // Team pending leave approvals
    this.leaveService.getTeamPendingLeaves().subscribe({
      next: d => { this.pendingLeaves.set(Array.isArray(d) ? d : []); this.isLoading.set(false); },
      error: () => { this.pendingLeaves.set([]); this.isLoading.set(false); }
    });

    // Team members (backend returns UserSummaryResponse: id, firstName, lastName, email, role, active, departmentName, designationTitle)
    this.employeeService.getMyTeam().subscribe({
      next: d => {
        const members = Array.isArray(d) ? d : [];
        this.teamMembers.set(members);
        this.buildCalData(members);
      },
      error: () => { this.teamMembers.set([]); this.calData = []; }
    });

    // Team performance reviews
    this.performanceService.getTeamReviews().subscribe({
      next: d => this.reviews.set((Array.isArray(d) ? d : []).slice(0, 4)),
      error: () => this.reviews.set([])
    });
  }

  buildCalData(members: any[]) {
    this.calData = members.slice(0, 6).map((m: any, i: number) => ({
      initials: this.getInitials(this.getMemberName(m)),
      name: this.getMemberName(m),
      color: this.colors[i % this.colors.length],
      days: ['present', 'present', 'present', 'present', 'present']
    }));

    this.leaveService.getTeamAllLeaves().subscribe({
      next: (leaves: any[]) => {
        if (!Array.isArray(leaves)) return;
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((today.getDay() || 7) - 1));

        this.calData = this.calData.map((cd, idx) => {
          const member = members[idx];
          if (!member) return cd;
          const days = this.weekDays.map((_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const leave = leaves.find((l: any) =>
              l.employeeId === member.id && dateStr >= l.startDate && dateStr <= l.endDate
            );
            if (!leave) return 'present';
            if (leave.status === 'APPROVED') return 'on-leave';
            if (leave.status === 'PENDING') return 'pending';
            return 'present';
          });
          return { ...cd, days };
        });
      },
      error: () => {}
    });
  }

  approve(id: number) {
    this.actionError.set('');
    this.leaveService.approveLeave(id, '').subscribe({
      next: () => {
        this.pendingLeaves.update(l => l.filter(x => x.id !== id));
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to approve. Please try again.';
        this.actionError.set(msg);
        setTimeout(() => this.actionError.set(''), 5000);
      }
    });
  }

  reject(id: number) {
    const comment = prompt('Enter reason for rejection (required):');
    if (comment === null) return; // user cancelled
    if (!comment.trim()) {
      alert('Rejection reason is required.');
      return;
    }
    this.actionError.set('');
    this.leaveService.rejectLeave(id, comment.trim()).subscribe({
      next: () => {
        this.pendingLeaves.update(l => l.filter(x => x.id !== id));
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to reject. Please try again.';
        this.actionError.set(msg);
        setTimeout(() => this.actionError.set(''), 5000);
      }
    });
  }

  // Backend returns UserSummaryResponse: firstName + lastName (no single 'name' field)
  getMemberName(m: any): string {
    if (m.name) return m.name;
    const fn = m.firstName || '';
    const ln = m.lastName || '';
    return `${fn} ${ln}`.trim() || m.email || 'Unknown';
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(i: number): string {
    return `linear-gradient(135deg,${this.colors[i % this.colors.length]},${this.colors[(i + 1) % this.colors.length]})`;
  }

  getStars(rating: number): string { return '★'.repeat(Math.max(0, rating || 0)) + '☆'.repeat(5 - Math.max(0, rating || 0)); }

  getTotalBalance(): number {
    return this.myLeaveBalances().reduce((s, b) => s + (b.remaining ?? 0), 0);
  }
  getBarWidth(b: LeaveBalance): string {
    return (b.totalQuota ?? 0) > 0 ? `${((b.remaining ?? 0) / (b.totalQuota ?? 1)) * 100}%` : '0%';
  }

  toggleSearch() { this.showSearch.update(v => !v); }
  toggleNotifications() { this.showNotifications.update(v => !v); }
}
