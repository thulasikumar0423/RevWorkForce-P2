import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { PerformanceService } from '../../../core/services/performance.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  goals = signal<any[]>([]);
  teamMembers = signal<any[]>([]);
  isLoading = signal(true);
  filterEmployee = signal('ALL');
  filterStatus = signal('ALL');
  successMsg = signal('');
  errorMsg = signal('');
  showProgressModal = signal(false);
  selectedGoal: any = null;
  newProgress = 0;

  constructor(private perf: PerformanceService, private empService: EmployeeService, public auth: AuthService) {}

  ngOnInit() {
    this.empService.getMyTeam().subscribe({ next: d => this.teamMembers.set(Array.isArray(d) ? d : []), error: () => this.teamMembers.set([]) });
    this.loadGoals();
  }

  loadGoals() {
    this.isLoading.set(true);
    this.perf.getTeamGoals().subscribe({
      next: d => { this.goals.set(Array.isArray(d) ? d : []); this.isLoading.set(false); },
      error: () => { this.goals.set([]); this.isLoading.set(false); }
    });
  }

  get filtered() {
    let list = this.goals();
    if (this.filterEmployee() !== 'ALL') list = list.filter((g: any) => g.userId == +this.filterEmployee());
    if (this.filterStatus() !== 'ALL') list = list.filter((g: any) => g.status === this.filterStatus());
    return list;
  }

  openProgress(g: any) { this.selectedGoal = g; this.newProgress = g.progress || 0; this.showProgressModal.set(true); }

  updateProgress() {
    if (!this.selectedGoal) return;
    this.perf.updateGoalProgress(this.selectedGoal.id, this.newProgress).subscribe({
      next: () => { this.loadGoals(); this.showProgressModal.set(false); this.showSuccess('Progress updated!'); },
      error: () => this.showError('Failed to update progress.')
    });
  }

  getPriorityClass(p: string): string {
    return p === 'HIGH' ? 'text-danger fw-bold' : p === 'MEDIUM' ? 'text-warning fw-bold' : 'text-success fw-bold';
  }

  getStatusBadge(s: string): string {
    return s === 'COMPLETED' ? 'badge bg-success' : s === 'IN_PROGRESS' ? 'badge bg-primary' : 'badge bg-secondary';
  }

  showSuccess(msg: string) { this.successMsg.set(msg); setTimeout(() => this.successMsg.set(''), 3000); }
  showError(msg: string) { this.errorMsg.set(msg); setTimeout(() => this.errorMsg.set(''), 4000); }


// Stats required by template
completedCount = 0;
inProgressCount = 0;
avgProgress = 0;

employees: string[] = [];

filterPriority = signal<string>('ALL');

commentText = '';

showCommentModal = signal(false);
selectedGoalSignal = signal<any>(null);

// Template helpers
getInitials(name: string): string {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase();
}

getAvatarColor(name: string): string {
  return '#8b5cf6';
}

getProgressColor(progress: number): string {
  if (progress < 40) return '#ef4444';
  if (progress < 70) return '#f59e0b';
  return '#22c55e';
}

getStatusLabel(status: string): string {
  return status;
}

openComment(goal: any) {
  this.selectedGoalSignal.set(goal);
  this.showCommentModal.set(true);
}

closeComment() {
  this.showCommentModal.set(false);
}

saveComment() {
  this.showCommentModal.set(false);
}
}
