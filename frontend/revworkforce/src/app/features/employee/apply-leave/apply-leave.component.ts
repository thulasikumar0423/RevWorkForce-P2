import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { LeaveService } from '../../../core/services/leave.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeaveBalance, LeaveType } from '../../../core/models/leave.model';

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.css']
})
export class ApplyLeaveComponent implements OnInit {
  // leaveTypes from API but with balance merged in
  leaveTypesWithBalance = signal<(LeaveType & { remaining: number; totalQuota: number })[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  form = { leaveTypeId: null as number | null, fromDate: '', toDate: '', reason: '' };
  today = new Date().toISOString().split('T')[0];

  constructor(
    private leaveService: LeaveService,
    public auth: AuthService,
    public router: Router
  ) {}

  ngOnInit() {
    this.loadTypesAndBalances();
  }

  loadTypesAndBalances() {
    this.isLoading.set(true);
    // Load leave types and balances in parallel, then merge
    let types: any[] = [];
    let balances: any[] = [];
    let typesLoaded = false;
    let balancesLoaded = false;

    const tryMerge = () => {
      if (!typesLoaded || !balancesLoaded) return;
      const merged = types.map(t => {
        const b = balances.find((b: any) => b.leaveTypeId === t.id);
        return {
          ...t,
          remaining: b?.remaining ?? 0,
          totalQuota: b?.totalQuota ?? t.defaultQuota ?? 0
        };
      });
      this.leaveTypesWithBalance.set(merged);
      this.isLoading.set(false);
    };

    this.leaveService.getLeaveTypes().subscribe({
      next: d => { types = Array.isArray(d) ? d : []; typesLoaded = true; tryMerge(); },
      error: () => { typesLoaded = true; this.isLoading.set(false); }
    });

    this.leaveService.getMyBalances().subscribe({
      next: d => { balances = Array.isArray(d) ? d : []; balancesLoaded = true; tryMerge(); },
      error: () => { balancesLoaded = true; tryMerge(); }
    });
  }

  // Get balance for currently selected leave type
  getSelectedBalance(): { remaining: number; totalQuota: number } | null {
    if (!this.form.leaveTypeId) return null;
    return this.leaveTypesWithBalance().find(t => t.id === +this.form.leaveTypeId!) ?? null;
  }

  getDays(): number {
    if (!this.form.fromDate || !this.form.toDate) return 0;
    const d = (new Date(this.form.toDate).getTime() - new Date(this.form.fromDate).getTime()) / (1000 * 60 * 60 * 24) + 1;
    return d > 0 ? d : 0;
  }

  isBalanceInsufficient(): boolean {
    const bal = this.getSelectedBalance();
    if (!bal) return false;
    return this.getDays() > bal.remaining;
  }

  submit() {
    if (!this.form.leaveTypeId || !this.form.fromDate || !this.form.toDate || !this.form.reason.trim()) {
      this.showError('All fields are required.'); return;
    }
    if (new Date(this.form.fromDate) > new Date(this.form.toDate)) {
      this.showError('End date must be on or after start date.'); return;
    }
    if (this.isBalanceInsufficient()) {
      this.showError('Insufficient leave balance.'); return;
    }
    this.isSubmitting.set(true);
    const payload = {
      leaveTypeId: this.form.leaveTypeId,
      fromDate: this.form.fromDate,
      toDate: this.form.toDate,
      reason: this.form.reason
    };
    this.leaveService.applyLeave(payload).subscribe({
      next: () => {
        this.showSuccess('Leave applied successfully! Awaiting manager approval.');
        this.form = { leaveTypeId: null, fromDate: '', toDate: '', reason: '' };
        this.isSubmitting.set(false);
        // Refresh balances after applying
        this.loadTypesAndBalances();
        setTimeout(() => this.router.navigate(['/' + this.getRole() + '/my-leaves']), 2000);
      },
      error: err => {
        this.showError(err?.error?.message || 'Failed to apply leave. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  onSubmit() { this.submit(); }

  getRole(): string { return (this.auth.getRole() || 'EMPLOYEE').toLowerCase(); }
  getSidebarRole(): 'EMPLOYEE' | 'MANAGER' | 'ADMIN' {
    const r = this.auth.getRole();
    return (r === 'MANAGER' || r === 'ADMIN') ? r as any : 'EMPLOYEE';
  }
  showSuccess(msg: string) { this.successMsg.set(msg); setTimeout(() => this.successMsg.set(''), 4000); }
  showError(msg: string) { this.errorMsg.set(msg); setTimeout(() => this.errorMsg.set(''), 5000); }
  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  balanceColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  getBalancePercent(t: any): number {
    return t.totalQuota > 0 ? Math.round((t.remaining / t.totalQuota) * 100) : 0;
  }
  getBalanceColor(t: any): string {
    const pct = this.getBalancePercent(t);
    if (pct > 60) return '#10b981';
    if (pct > 30) return '#f59e0b';
    return '#ef4444';
  }
}
