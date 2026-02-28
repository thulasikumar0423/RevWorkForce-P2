import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { LeaveService } from '../../../core/services/leave.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-team-calendar',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './team-calendar.component.html',
  styleUrls: ['./team-calendar.component.css']
})
export class TeamCalendarComponent implements OnInit {

  currentDate = signal(new Date());
  isLoading = signal(true);
  errorMsg = signal('');

  // Populated from API only — no static fallback
  teamMembers: { id: number; name: string; initials: string; color: string }[] = [];
  leaveData: any[] = [];

  private readonly palette = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#ef4444', '#6b7280'];

  get year()  { return this.currentDate().getFullYear(); }
  get month() { return this.currentDate().getMonth(); }
  get monthName() { return this.currentDate().toLocaleString('default', { month: 'long', year: 'numeric' }); }
  get daysInMonth() { return new Date(this.year, this.month + 1, 0).getDate(); }
  get firstDayOfMonth() { return new Date(this.year, this.month, 1).getDay() || 7; }
  get calDays(): number[] { return Array.from({ length: this.daysInMonth }, (_, i) => i + 1); }
  get emptyDays(): number[] { return Array.from({ length: this.firstDayOfMonth - 1 }, (_, i) => i); }

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.loadTeamMembers();
    this.loadCalendar();
  }

  loadTeamMembers() {
    this.employeeService.getMyTeam().subscribe({
      next: (data: any) => {
        const members = Array.isArray(data) ? data : [];
        this.teamMembers = members.map((m: any, i: number) => ({
          id: m.id,
          name: `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.name || 'Unknown',
          initials: this.getInitials(`${m.firstName || ''} ${m.lastName || ''}`.trim() || m.name),
          color: this.palette[i % this.palette.length]
        }));
        this.isLoading.set(false);
      },
      error: () => {
        this.teamMembers = [];
        this.errorMsg.set('Failed to load team members.');
        this.isLoading.set(false);
      }
    });
  }

  loadCalendar() {
    this.leaveService.getTeamCalendar().subscribe({
      next: (data: any) => {
        this.leaveData = Array.isArray(data) ? data.map((item: any) => ({
          employeeId: item.employeeId || item.userId,
          startDate: item.startDate,
          endDate: item.endDate,
          type: item.leaveType?.substring(0, 2).toUpperCase() || 'LV',
          status: item.status
        })) : [];
      },
      error: () => {
        this.leaveData = [];
      }
    });
  }

  prevMonth() {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() - 1);
    this.currentDate.set(d);
    this.loadCalendar();
  }

  nextMonth() {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() + 1);
    this.currentDate.set(d);
    this.loadCalendar();
  }

  getLeavesOnDay(day: number): any[] {
    const dateStr = `${this.year}-${String(this.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return this.leaveData.filter(l => dateStr >= l.startDate && dateStr <= l.endDate);
  }

  getMemberById(id: number) {
    return this.teamMembers.find(m => m.id === id);
  }

  isToday(day: number): boolean {
    const t = new Date();
    return t.getDate() === day && t.getMonth() === this.month && t.getFullYear() === this.year;
  }

  isWeekend(day: number): boolean {
    const d = new Date(this.year, this.month, day).getDay();
    return d === 0 || d === 6;
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  }

  getLeaveSummary(): { name: string; count: number; color: string }[] {
    return this.teamMembers.map(m => ({
      name: m.name,
      color: m.color,
      count: this.leaveData.filter(l => l.employeeId === m.id &&
        new Date(l.startDate).getMonth() === this.month).length
    })).filter(x => x.count > 0);
  }
}
