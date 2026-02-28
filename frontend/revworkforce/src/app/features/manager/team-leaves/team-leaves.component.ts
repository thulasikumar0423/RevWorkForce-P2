import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { LeaveService } from '../../../core/services/leave.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-team-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './team-leaves.component.html',
  styleUrls: ['./team-leaves.component.css']
})
export class TeamLeavesComponent implements OnInit {

  allLeaves = signal<any[]>([]);
  employees = signal<any[]>([]);
  leaveTypes = signal<any[]>([]);
  isLoading = signal(true);

  filterStatus = signal('ALL');
  selectedEmployee = signal('ALL');

  successMsg = signal('');
  errorMsg = signal('');

  showFeedbackModal = signal(false);

  feedback = {
    leaveId: null as number | null,
    action: '',
    comments: ''
  };

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    public auth: AuthService   // ✅ FIX: template needs this
  ) {}

  ngOnInit() {

    this.leaveService.getTeamAllLeaves().subscribe({
      next: d => {
        this.allLeaves.set(Array.isArray(d) ? d : []);
        this.isLoading.set(false);
      },
      error: () => {
        this.allLeaves.set([]);
        this.isLoading.set(false);
      }
    });

    this.employeeService.getMyTeam().subscribe({
      next: d => this.employees.set(Array.isArray(d) ? d : []),
      error: () => this.employees.set([])
    });

    this.leaveService.getLeaveTypes().subscribe({
      next: d => this.leaveTypes.set(Array.isArray(d) ? d : []),
      error: () => this.leaveTypes.set([])
    });
  }

  get filtered() {
    let list = this.allLeaves();

    if (this.filterStatus() !== 'ALL') {
      list = list.filter(l => l.status === this.filterStatus());
    }

    if (this.selectedEmployee() !== 'ALL') {
      list = list.filter(l => l.userId == +this.selectedEmployee());
    }

    return list;
  }

  approve(id: number) {
    this.leaveService.approveLeave(id, '').subscribe({
      next: () => {
        this.allLeaves.update(l =>
          l.map(x => x.id === id ? { ...x, status: 'APPROVED' } : x)
        );
        this.showSuccess('Leave approved!');
      },
      error: err =>
        this.showError(err?.error?.message || 'Failed to approve.')
    });
  }

  reject(id: number) {
    const c = prompt('Reason for rejection (required):');
    if (!c?.trim()) return;

    this.leaveService.rejectLeave(id, c).subscribe({
      next: () => {
        this.allLeaves.update(l =>
          l.map(x => x.id === id ? { ...x, status: 'REJECTED' } : x)
        );
        this.showSuccess('Leave rejected.');
      },
      error: err =>
        this.showError(err?.error?.message || 'Failed to reject.')
    });
  }

  openFeedbackModal(leave: any, action: string) {
    this.feedback.leaveId = leave.id;
    this.feedback.action = action;
    this.showFeedbackModal.set(true);
  }

  submitFeedback() {
    this.showFeedbackModal.set(false);
  }

  getStatusClass(s: string): string {
    return s === 'APPROVED'
      ? 'badge bg-success'
      : s === 'REJECTED'
      ? 'badge bg-danger'
      : s === 'PENDING'
      ? 'badge bg-warning text-dark'
      : 'badge bg-secondary';
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  showSuccess(msg: string) {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(''), 3000);
  }

  showError(msg: string) {
    this.errorMsg.set(msg);
    setTimeout(() => this.errorMsg.set(''), 4000);
  }
}