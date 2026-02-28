import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { LeaveService } from '../../../core/services/leave.service';
import { LeaveApplication } from '../../../core/models/leave.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-leave-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './leave-approvals.component.html',
  styleUrls: ['./leave-approvals.component.css']
})
export class LeaveApprovalsComponent implements OnInit {
  allLeaves = signal<LeaveApplication[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMsg = signal('');
  successMsg = signal('');
  activeFilter = signal<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  searchTerm = signal('');

  showModal = signal(false);
  modalMode = signal<'APPROVE' | 'REJECT'>('APPROVE');
  selectedLeave = signal<LeaveApplication | null>(null);
  comment = '';

  constructor(private leaveService: LeaveService, public auth: AuthService) {}

  ngOnInit() { this.loadLeaves(); }

  loadLeaves() {
    this.isLoading.set(true);
    this.errorMsg.set('');
    // Load ALL team leaves (all statuses) for manager view
    this.leaveService.getTeamAllLeaves().subscribe({
      next: (data: any) => {
        this.allLeaves.set(Array.isArray(data) ? data : []);
        this.isLoading.set(false);
      },
      error: () => {
        this.allLeaves.set([]);
        this.errorMsg.set('Failed to load leave applications. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  get filteredLeaves(): LeaveApplication[] {
    return this.allLeaves().filter(l => {
      const matchFilter = this.activeFilter() === 'ALL' || l.status === this.activeFilter();
      const matchSearch = !this.searchTerm() ||
        l.employeeName?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        l.leaveType.toLowerCase().includes(this.searchTerm().toLowerCase());
      return matchFilter && matchSearch;
    });
  }

  get pendingCount()  { return this.allLeaves().filter(l => l.status === 'PENDING').length; }
  get approvedCount() { return this.allLeaves().filter(l => l.status === 'APPROVED').length; }
  get rejectedCount() { return this.allLeaves().filter(l => l.status === 'REJECTED').length; }

  openModal(leave: LeaveApplication, mode: 'APPROVE' | 'REJECT') {
    this.selectedLeave.set(leave);
    this.modalMode.set(mode);
    this.comment = '';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedLeave.set(null);
    this.comment = '';
  }

  submitAction() {
    const leave = this.selectedLeave();
    if (!leave) return;
    if (this.modalMode() === 'REJECT' && !this.comment.trim()) return;

    this.isSubmitting.set(true);
    this.errorMsg.set('');

    const action$ = this.modalMode() === 'APPROVE'
      ? this.leaveService.approveLeave(leave.id, this.comment)
      : this.leaveService.rejectLeave(leave.id, this.comment.trim());

    action$.subscribe({
      next: () => {
        const newStatus = this.modalMode() === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        this.allLeaves.update(list =>
          list.map(l => l.id === leave.id
            ? { ...l, status: newStatus as LeaveApplication['status'], managerComment: this.comment }
            : l
          )
        );
        this.successMsg.set(`Leave ${newStatus.toLowerCase()} successfully.`);
        setTimeout(() => this.successMsg.set(''), 3000);
        this.isSubmitting.set(false);
        this.closeModal();
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Action failed. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  getManagerName(): string {
    const u = this.auth.currentUser();
    if (!u) return '?';
    return u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '?';
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(name: string): string {
    const colors = ['linear-gradient(135deg,#3b82f6,#1d4ed8)', 'linear-gradient(135deg,#10b981,#059669)',
      'linear-gradient(135deg,#8b5cf6,#6d28d9)', 'linear-gradient(135deg,#f59e0b,#d97706)',
      'linear-gradient(135deg,#ec4899,#be185d)', 'linear-gradient(135deg,#14b8a6,#0d9488)'];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  }
}
