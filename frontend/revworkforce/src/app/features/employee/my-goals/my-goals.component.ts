import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { PerformanceService } from '../../../core/services/performance.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './my-goals.component.html',
  styleUrls: ['./my-goals.component.css']
})
export class MyGoalsComponent implements OnInit {

  goals = signal<any[]>([]);
  isLoading = signal(true);

  showModal = signal(false);
  showAddForm = this.showModal;

  isSaving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  progressGoalId: number | null = null;
  progressValue = 0;

  goalForm = {
    title: '',
    description: '',
    deadline: '',
    priority: 'MEDIUM'
  };

  newGoal = this.goalForm;
  priorities = ['HIGH', 'MEDIUM', 'LOW'];

  constructor(
    private perf: PerformanceService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);

    this.perf.getMyGoals().subscribe({
      next: d => {
        this.goals.set(Array.isArray(d) ? d : []);
        this.isLoading.set(false);
      },
      error: () => {
        this.goals.set([]);
        this.isLoading.set(false);
      }
    });
  }

  openCreate() {
    this.goalForm = {
      title: '',
      description: '',
      deadline: '',
      priority: 'MEDIUM'
    };
    this.newGoal = this.goalForm;
    this.showModal.set(true);
  }

  /* ✅ UPDATED: now supports Angular validation */
  addGoal(form: NgForm) {

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.saveGoal();
  }

  saveGoal() {

    // keep your previous safety check also
    if (!this.goalForm.title || !this.goalForm.deadline) {
      this.showError('Title and deadline are required.');
      return;
    }

    this.isSaving.set(true);

    const payload = {
      ...this.goalForm,
      employeeId: this.auth.getCurrentUser()?.id
    };

    this.perf.createGoal(payload).subscribe({
      next: () => {
        this.load();
        this.showModal.set(false);
        this.showSuccess('Goal created!');
        this.isSaving.set(false);
      },
      error: () => {
        this.showError('Failed to create goal.');
        this.isSaving.set(false);
      }
    });
  }

  openProgress(goal: any) {
    this.progressGoalId = goal.id;
    this.progressValue = goal.progress || 0;
  }

  updateProgress(id?: number, value?: number) {

    if (id != null) this.progressGoalId = id;
    if (value != null) this.progressValue = +value;

    if (this.progressGoalId == null) return;

    this.perf.updateGoalProgress(
      this.progressGoalId,
      this.progressValue
    ).subscribe({
      next: () => {
        this.load();
        this.progressGoalId = null;
        this.showSuccess('Progress updated!');
      },
      error: () => this.showError('Failed to update progress.')
    });
  }

  deleteGoal(id: number) {

    if (!confirm('Delete this goal?')) return;

    this.perf.deleteGoal(id).subscribe({
      next: () => {
        this.load();
        this.showSuccess('Goal deleted.');
      },
      error: () => this.showError('Failed to delete goal.')
    });
  }

  getPriorityClass(p: string): string {
    return p === 'HIGH'
      ? 'text-danger'
      : p === 'MEDIUM'
      ? 'text-warning'
      : 'text-success';
  }

  getStatusClass(s: string): string {
    return s === 'COMPLETED'
      ? 'badge bg-success'
      : s === 'IN_PROGRESS'
      ? 'badge bg-primary'
      : 'badge bg-secondary';
  }

  showSuccess(msg: string) {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(''), 3000);
  }

  showError(msg: string) {
    this.errorMsg.set(msg);
    setTimeout(() => this.errorMsg.set(''), 4000);
  }

  getInitials(name: string): string {
    return name?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  getProgressColor(progress: number): string {
    if (progress < 40) return '#ef4444';
    if (progress < 70) return '#f59e0b';
    return '#22c55e';
  }
}