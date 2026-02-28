import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { LeaveService } from '../../../core/services/leave.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.css']
})
export class LeaveManagementComponent implements OnInit {

  activeTab = signal<'types' | 'balances' | 'all-leaves'>('all-leaves');

  leaveTypes = signal<any[]>([]);
  employees = signal<any[]>([]);
  allLeaves = signal<any[]>([]);

  isLoading = signal(true);
  isSaving = signal(false);

  showTypeModal = signal(false);
  isEditingType = signal(false);
  currentType: any = { name: '', maxDays: 0, description: '' };
  editingTypeId: number | null = null;

  showBalanceModal = signal(false);

  balanceForm = {
    employeeId: null as number | null,
    leaveTypeId: null as number | null,
    adjustment: 0,
    reason: ''
  };

  filterStatus = signal('ALL');
  searchTerm = signal('');

  successMsg = signal('');
  errorMsg = signal('');

  // ─────────────────────────────────────────────
  // Computed Stats
  // ─────────────────────────────────────────────

  totalLeaves = computed(() => this.allLeaves().length);

  pendingLeaves = computed(() =>
    this.allLeaves().filter(l => l.status === 'PENDING').length
  );

  approvedLeaves = computed(() =>
    this.allLeaves().filter(l => l.status === 'APPROVED').length
  );

  constructor(
    private employeeService: EmployeeService,
    private leaveService: LeaveService,
    public auth: AuthService
  ) {}

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.leaveService.getLeaveTypes().subscribe({
      next: d => this.leaveTypes.set(Array.isArray(d) ? d : []),
      error: () => this.leaveTypes.set([])
    });

    this.employeeService.getAllEmployees().subscribe({
      next: d => this.employees.set(Array.isArray(d) ? d : []),
      error: () => this.employees.set([])
    });

    this.loadAllLeaves();
  }

  loadAllLeaves() {
    this.isLoading.set(true);

    this.leaveService.getAllLeavesAdmin().subscribe({
      next: d => {
        this.allLeaves.set(Array.isArray(d) ? d : []);
        this.isLoading.set(false);
      },
      error: () => {
        this.allLeaves.set([]);
        this.isLoading.set(false);
      }
    });
  }

  // ─────────────────────────────────────────────
  // Filtering
  // ─────────────────────────────────────────────

  get filteredLeaves() {
    let list = this.allLeaves();

    if (this.filterStatus() !== 'ALL') {
      list = list.filter(l => l.status === this.filterStatus());
    }

    if (this.searchTerm()) {
      const s = this.searchTerm().toLowerCase();
      list = list.filter(l =>
        (l.employeeName || '').toLowerCase().includes(s) ||
        (l.leaveTypeName || '').toLowerCase().includes(s)
      );
    }

    return list;
  }

  // ─────────────────────────────────────────────
  // Leave Type Management
  // ─────────────────────────────────────────────

  openCreateType() {
    this.currentType = { name: '', maxDays: 0, description: '' };
    this.isEditingType.set(false);
    this.editingTypeId = null;
    this.showTypeModal.set(true);
  }

  openEditType(t: any) {
    this.currentType = { name: t.name, maxDays: t.defaultQuota };
    this.isEditingType.set(true);
    this.editingTypeId = t.id;
    this.showTypeModal.set(true);
  }

  saveLeaveType() {
    this.isSaving.set(true);

    const payload = {
      name: this.currentType.name,
      defaultQuota: this.currentType.maxDays
    };

    const obs =
      this.isEditingType() && this.editingTypeId
        ? this.leaveService.updateLeaveType(this.editingTypeId, payload)
        : this.leaveService.createLeaveType(payload);

    obs.subscribe({
      next: () => {
        this.loadAll();
        this.showTypeModal.set(false);
        this.showSuccess('Leave type saved successfully!');
        this.isSaving.set(false);
      },
      error: () => {
        this.showError('Failed to save leave type.');
        this.isSaving.set(false);
      }
    });
  }

  deleteType(id: number) {
    if (!confirm('Delete this leave type?')) return;

    this.leaveService.deleteLeaveType(id).subscribe({
      next: () => {
        this.loadAll();
        this.showSuccess('Leave type deleted.');
      },
      error: () => this.showError('Failed to delete.')
    });
  }

  // ─────────────────────────────────────────────
  // Adjust Leave Balance (FIXED)
  // ─────────────────────────────────────────────

  adjustBalance() {
    if (!this.balanceForm.employeeId ||
        !this.balanceForm.leaveTypeId ||
        !this.balanceForm.reason) {
      this.showError('Please fill all required fields.');
      return;
    }

    this.isSaving.set(true);

    this.leaveService.adjustLeaveBalance(
      this.balanceForm.employeeId,
      this.balanceForm.leaveTypeId,
      this.balanceForm.adjustment,
      this.balanceForm.reason
    ).subscribe({
      next: () => {
        this.showBalanceModal.set(false);
        this.showSuccess('Leave balance adjusted successfully!');
        this.isSaving.set(false);

        this.balanceForm = {
          employeeId: null,
          leaveTypeId: null,
          adjustment: 0,
          reason: ''
        };
      },
      error: err => {
        this.showError(err?.error?.message || 'Failed to adjust balance.');
        this.isSaving.set(false);
      }
    });
  }

  // ─────────────────────────────────────────────
  // Utility Methods
  // ─────────────────────────────────────────────

  getEmployeeName(id: number): string {
    const emp = this.employees().find(e => e.id === id);
    return emp
      ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim()
      : `Employee #${id}`;
  }

  getLeaveTypeName(id: number): string {
    const t = this.leaveTypes().find(t => t.id === id);
    return t ? t.name : `Type #${id}`;
  }

  getInitials(name: string) {
    return name?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
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