import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { LeaveService } from '../../../core/services/leave.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-leave-balance-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './leave-balance-management.component.html',
  styleUrls: ['./leave-balance-management.component.css']
})
export class LeaveBalanceManagementComponent implements OnInit {
  employees = signal<any[]>([]);
  leaveTypes = signal<any[]>([]);
  balances = signal<any[]>([]);
  isLoading = signal(true);
  
  showAssignModal = signal(false);
  showAdjustModal = signal(false);
  
  assignForm = { employeeId: 0, leaveTypeId: 0, totalQuota: 0 };
  adjustForm = { employeeId: 0, leaveTypeId: 0, adjustment: 0, reason: '' };

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => this.employees.set(data),
      error: () => this.employees.set([])
    });

    this.leaveService.getLeaveTypes().subscribe({
      next: (data) => this.leaveTypes.set(data),
      error: () => this.leaveTypes.set([])
    });

    this.leaveService.getAllLeaveBalances().subscribe({
      next: (data) => {
        this.balances.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.balances.set([]);
        this.isLoading.set(false);
      }
    });
  }

  openAssignModal() {
    this.assignForm = { employeeId: 0, leaveTypeId: 0, totalQuota: 0 };
    this.showAssignModal.set(true);
  }

  openAdjustModal() {
    this.adjustForm = { employeeId: 0, leaveTypeId: 0, adjustment: 0, reason: '' };
    this.showAdjustModal.set(true);
  }

  assignLeaveQuota() {
    if (!this.assignForm.employeeId || !this.assignForm.leaveTypeId || !this.assignForm.totalQuota) {
      alert('Please fill all fields');
      return;
    }

    this.leaveService.assignLeaveBalance(
      this.assignForm.employeeId,
      this.assignForm.leaveTypeId,
      this.assignForm.totalQuota
    ).subscribe({
      next: () => {
        this.showAssignModal.set(false);
        this.loadData();
        alert('Leave quota assigned successfully');
      },
      error: () => alert('Failed to assign leave quota')
    });
  }

  adjustLeaveBalance() {
    if (!this.adjustForm.employeeId || !this.adjustForm.leaveTypeId || !this.adjustForm.reason) {
      alert('Please fill all fields');
      return;
    }

    this.leaveService.adjustLeaveBalance(
      this.adjustForm.employeeId,
      this.adjustForm.leaveTypeId,
      this.adjustForm.adjustment,
      this.adjustForm.reason
    ).subscribe({
      next: () => {
        this.showAdjustModal.set(false);
        this.loadData();
        alert('Leave balance adjusted successfully');
      },
      error: () => alert('Failed to adjust leave balance')
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
