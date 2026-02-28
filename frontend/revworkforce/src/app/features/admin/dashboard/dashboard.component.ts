import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { LeaveService } from '../../../core/services/leave.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterLink,FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  employees = signal<any[]>([]);
  recentEmployees = signal<any[]>([]);
  isLoading = signal(true);
  today = new Date();
  stats = signal({ total: 0, active: 0, inactive: 0, departments: 0, onLeave: 0, openReviews: 0});
  departments = signal<any[]>([]);
  leaveStats = signal<any[]>([]);
  searchTerm = signal('');
filteredEmployees = signal<any[]>([]);

  configs = [
  {
    icon: 'bi-building',
    color: '#3b82f6',
    bg: '#e0f2fe',
    name: 'Departments',
    desc: 'Manage company departments',
    route: '/admin/departments',
    btn: 'Open'
  },
  {
    icon: 'bi-briefcase',
    color: '#10b981',
    bg: '#d1fae5',
    name: 'Designations',
    desc: 'Manage job titles & roles',
    route: '/admin/designations',
    btn: 'Open'
  },
  {
    icon: 'bi-megaphone',
    color: '#f59e0b',
    bg: '#fef3c7',
    name: 'Announcements',
    desc: 'Create & publish updates',
    route: '/admin/announcements',
    btn: 'Open'
  },
  {
    icon: 'bi-calendar3',
    color: '#8b5cf6',
    bg: '#ede9fe',
    name: 'Holiday Calendar',
    desc: 'Add/edit company holidays',
    route: '/admin/holidays',
    btn: 'Open'
  },
  {
    icon: 'bi-calendar2-week',
    color: '#14b8a6',
    bg: '#ccfbf1',
    name: 'Leave Management',
    desc: 'Configure leave types & balances',
    route: '/admin/leave-management',
    btn: 'Open'
  },
  {
    icon: 'bi-wallet2',
    color: '#06b6d4',
    bg: '#cffafe',
    name: 'Leave Balance',
    desc: 'Assign and adjust leave quotas',
    route: '/admin/leave-balance-management',
    btn: 'Open'
  },
  {
    icon: 'bi-file-earmark-bar-graph',
    color: '#ef4444',
    bg: '#fee2e2',
    name: 'Leave Reports',
    desc: 'Department & employee reports',
    route: '/admin/leave-reports',
    btn: 'Open'
  },
  {
    icon: 'bi-activity',
    color: '#64748b',
    bg: '#f1f5f9',
    name: 'Activity Logs',
    desc: 'System activity & audit logs',
    route: '/admin/activity-logs',
    btn: 'Open'
  }
];

  constructor(private employeeService: EmployeeService, private leaveService: LeaveService, public auth: AuthService) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.isLoading.set(true);
    this.employeeService.getAllEmployees().subscribe({
      next: d => {
        const list = Array.isArray(d) ? d : [];
        this.employees.set(list);
        this.filteredEmployees.set(list);
        this.recentEmployees.set(list.slice(0, 6));
        this.calculateStats(list);
        this.isLoading.set(false);
      },
      error: () => { this.employees.set([]); this.isLoading.set(false); }
    });
    this.leaveService.getAllLeavesAdmin().subscribe({
      next: leaves => {
        const arr = Array.isArray(leaves) ? leaves : [];
        this.leaveStats.set([
          { label: 'Pending', count: arr.filter((l: any) => l.status === 'PENDING').length, color: '#f59e0b', icon: 'bi-clock' },
          { label: 'Approved', count: arr.filter((l: any) => l.status === 'APPROVED').length, color: '#10b981', icon: 'bi-check-circle' },
          { label: 'Rejected', count: arr.filter((l: any) => l.status === 'REJECTED').length, color: '#ef4444', icon: 'bi-x-circle' },
          { label: 'Total', count: arr.length, color: '#3b82f6', icon: 'bi-calendar2-week' }
        ]);
      },
      error: () => this.leaveStats.set([])
    });
  }

  calculateStats(employees: any[]) {
    const total = employees.length;
    const active = employees.filter(e => e.active).length;
    const deptSet = new Set(employees.map(e => e.departmentName).filter(Boolean));
    this.stats.set({ total, active, inactive: total - active, departments: deptSet.size,  onLeave: 0, openReviews: 0 });
    const deptCounts: any = {};
    employees.forEach(e => { if (e.departmentName) deptCounts[e.departmentName] = (deptCounts[e.departmentName] || 0) + 1; });
    const colors = ['#3b82f6', '#ec4899', '#f59e0b', '#14b8a6', '#8b5cf6', '#10b981'];
    this.departments.set(Object.entries(deptCounts).map(([name, count], i) => ({ name, count, color: colors[i % colors.length] })));
  }

  getInitials(emp: any): string {

  if (!emp) return '?';

  // If string passed (emp.name)
  if (typeof emp === 'string') {
    return emp
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // If full object passed
  const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();

  return name
    ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
}
  getAvatarColor(i: number): string {
    const c = ['linear-gradient(135deg,#3b82f6,#1d4ed8)','linear-gradient(135deg,#10b981,#059669)',
      'linear-gradient(135deg,#ec4899,#be185d)','linear-gradient(135deg,#f59e0b,#d97706)',
      'linear-gradient(135deg,#8b5cf6,#6d28d9)','linear-gradient(135deg,#14b8a6,#0f766e)'];
    return c[i % c.length];
  }

deactivate(id: number) {
  this.employeeService.deactivateEmployee(id)
    .subscribe(() => this.loadData());
}
reactivate(id: number) {
  console.log('Reactivate employee', id);
}
showSearch = signal(false);
showNotifications = signal(false);

toggleSearch() {
  this.showSearch.update(v => !v);
}

toggleNotifications() {
  this.showNotifications.update(v => !v);
}

onSearch() {
  const term = this.searchTerm().toLowerCase();

  const filtered = this.employees().filter(emp => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    return (
      fullName.includes(term) ||
      emp.employeeId?.toLowerCase().includes(term) ||
      emp.departmentName?.toLowerCase().includes(term)
    );
  });

  this.filteredEmployees.set(filtered);
}
}
