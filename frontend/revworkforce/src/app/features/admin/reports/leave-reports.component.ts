import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { LeaveService } from '../../../core/services/leave.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-leave-reports',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './leave-reports.component.html',
  styleUrls: ['./leave-reports.component.css']
})
export class LeaveReportsComponent implements OnInit {
  reportType = signal<'department' | 'employee' | 'utilization' | 'employeeReport'>('department');
  reports = signal<any[]>([]);
  isLoading = signal(false);

  constructor(
    private leaveService: LeaveService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.loadReport();
  }

  switchReport(type: 'department' | 'employee' | 'utilization' | 'employeeReport') {
    this.reportType.set(type);
    this.loadReport();
  }

  loadReport() {
    this.isLoading.set(true);
    
    if (this.reportType() === 'utilization') {
      this.leaveService.getAllLeaves().subscribe({
        next: (data) => {
          this.reports.set(this.calculateUtilization(data));
          this.isLoading.set(false);
        },
        error: () => {
          this.reports.set([]);
          this.isLoading.set(false);
        }
      });
    } else if (this.reportType() === 'employeeReport') {
      this.leaveService.getAllEmployees().subscribe({
        next: (data) => {
          this.reports.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.reports.set([]);
          this.isLoading.set(false);
        }
      });
    } else {
      const service = this.reportType() === 'department' 
        ? this.leaveService.getDepartmentWiseReport()
        : this.leaveService.getEmployeeWiseReport();

      service.subscribe({
        next: (data) => {
          this.reports.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.reports.set([]);
          this.isLoading.set(false);
        }
      });
    }
  }

  calculateUtilization(leaves: any[]) {
    const grouped = leaves.reduce((acc: any, leave: any) => {
      const key = leave.employeeName;
      if (!acc[key]) {
        acc[key] = {
          name: leave.employeeName,
          totalLeaves: 0,
          approvedLeaves: 0,
          utilizationRate: 0
        };
      }
      acc[key].totalLeaves++;
      if (leave.status === 'APPROVED') acc[key].approvedLeaves++;
      return acc;
    }, {});

    return Object.values(grouped).map((item: any) => ({
      ...item,
      utilizationRate: item.totalLeaves > 0 ? Math.round((item.approvedLeaves / item.totalLeaves) * 100) : 0
    }));
  }

  getTotalLeaves(): number {
    if (this.reportType() === 'employeeReport') return this.reports().length;
    return this.reports().reduce((sum, r) => sum + (r.totalLeaves || 0), 0);
  }

  getTotalApproved(): number {
    if (this.reportType() === 'employeeReport') return this.reports().filter(r => r.active).length;
    if (this.reportType() === 'utilization') return this.reports().reduce((sum, r) => sum + (r.approvedLeaves || 0), 0);
    return this.reports().reduce((sum, r) => sum + (r.approvedLeaves || 0), 0);
  }

  getTotalPending(): number {
    if (this.reportType() === 'employeeReport') return 0;
    if (this.reportType() === 'utilization') return 0;
    return this.reports().reduce((sum, r) => sum + (r.pendingLeaves || 0), 0);
  }

  getTotalRejected(): number {
    if (this.reportType() === 'employeeReport') return this.reports().filter(r => !r.active).length;
    if (this.reportType() === 'utilization') return 0;
    return this.reports().reduce((sum, r) => sum + (r.rejectedLeaves || 0), 0);
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
