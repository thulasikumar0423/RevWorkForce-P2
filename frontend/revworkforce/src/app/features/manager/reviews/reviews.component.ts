import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { PerformanceService } from '../../../core/services/performance.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {

  reviews = signal<any[]>([]);
  teamMembers = signal<any[]>([]);
  isLoading = signal(true);

  // ✅ Matches HTML
  activeFilter = signal<string>('ALL');

  showModal = signal(false);
  selectedReview = signal<any>(null);

  feedbackText = '';
  managerRating = 0;
  hoverRating = signal(0);

  successMsg = signal('');
  errorMsg = signal('');

  constructor(
    private perf: PerformanceService,
    private empService: EmployeeService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.empService.getMyTeam().subscribe({
      next: d => this.teamMembers.set(Array.isArray(d) ? d : []),
      error: () => this.teamMembers.set([])
    });

    this.loadReviews();
  }

  loadReviews() {
    this.isLoading.set(true);

    this.perf.getTeamReviews().subscribe({
      next: d => {
        this.reviews.set(Array.isArray(d) ? d : []);
        this.isLoading.set(false);
      },
      error: () => {
        this.reviews.set([]);
        this.isLoading.set(false);
      }
    });
  }

  // ✅ Used in template
  get filtered() {
  if (this.activeFilter() === 'ALL') return this.reviews();

  if (this.activeFilter() === 'PENDING') {
    return this.reviews().filter(r => r.status === 'SUBMITTED');
  }

  return this.reviews().filter(r => r.status === this.activeFilter());
}

  // ✅ Stats used in template
  pendingCount = computed(() =>
  this.reviews().filter(r => r.status === 'SUBMITTED').length
);

  reviewedCount = computed(() =>
    this.reviews().filter(r => r.status === 'REVIEWED').length
  );

  // ✅ Modal open
  openReview(review: any) {
    this.selectedReview.set(review);
    this.feedbackText = review.managerFeedback || '';
    this.managerRating = review.managerRating || 0;
    this.hoverRating.set(0);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  // ⭐ Star logic
  setRating(star: number) {
    this.managerRating = star;
  }

  hoverStar(star: number) {
    this.hoverRating.set(star);
  }

  leaveStar() {
    this.hoverRating.set(0);
  }

  activeRating() {
    return this.hoverRating() || this.managerRating;
  }

  // ✅ Submit feedback
  submitFeedback() {
    const review = this.selectedReview();
    if (!review) return;

    if (!this.feedbackText.trim() || !this.managerRating) {
      this.showError('Please provide feedback and rating.');
      return;
    }

    this.perf.provideFeedback(review.id, {
      feedback: this.feedbackText,
      rating: this.managerRating
    }).subscribe({
      next: () => {
        this.loadReviews();
        this.closeModal();
        this.showSuccess('Feedback submitted successfully!');
      },
      error: err => {
        this.showError(
          err?.error?.message ||
          'Failed. Only SUBMITTED reviews can receive feedback.'
        );
      }
    });
  }

  // Utilities
  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    return '#6366f1';
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