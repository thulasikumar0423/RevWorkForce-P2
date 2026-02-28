import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { PerformanceService } from '../../../core/services/performance.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './my-reviews.component.html',
  styleUrls: ['./my-reviews.component.css']
})
export class MyReviewsComponent implements OnInit {

  reviews = signal<any[]>([]);
  isLoading = signal(true);

  showCreateModal = signal(false);
  showReviewDrawer = signal(false);
  isSubmitting = signal(false);

  selectedReview = signal<any>(null);

  reviewForm = {
    deliverables: '',
    accomplishments: '',
    improvementAreas: '',
    selfRating: 3,
    year: new Date().getFullYear()
  };

  newReview = this.reviewForm;

  constructor(
    private perf: PerformanceService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading.set(true);

    this.perf.getMyReviews().subscribe({
      next: res => {
        this.reviews.set(Array.isArray(res) ? res : []);
        this.isLoading.set(false);
      },
      error: () => {
        this.reviews.set([]);
        this.isLoading.set(false);
      }
    });
  }

  openCreate() {
    this.reviewForm = {
      deliverables: '',
      accomplishments: '',
      improvementAreas: '',
      selfRating: 3,
      year: new Date().getFullYear()
    };
    this.newReview = this.reviewForm;
    this.showCreateModal.set(true);
  }

  createReview(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    this.saveReview();
  }

  saveReview() {
    this.isSubmitting.set(true);

   const currentUser = this.auth.getCurrentUser();
const employeeId = currentUser?.id || this.auth.getCurrentUserId();

const payload = {
  ...this.reviewForm,
  employeeId: employeeId
};

    this.perf.createReview(payload).subscribe({
      next: () => {
        this.load();
        this.showCreateModal.set(false);
        this.isSubmitting.set(false);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  /* ✅ ADDED: Submit Review Feature */
  submitReview(id: number) {

    if (!confirm('Submit this review to your manager?')) return;

    this.perf.submitReview(id).subscribe({
      next: () => {
        this.load();
      },
      error: () => {
        alert('Only draft reviews can be submitted.');
      }
    });
  }

  openReview(review: any) {
    this.selectedReview.set(review);
    this.showReviewDrawer.set(true);
  }

  closeReview() {
    this.showReviewDrawer.set(false);
  }

  deleteReview(id: number) {
    if (!confirm('Delete this review?')) return;

    this.perf.deleteReview(id).subscribe(() => {
      this.load();
    });
  }

  getStars(r: number): string {
    return '★'.repeat(r || 0) + '☆'.repeat(5 - (r || 0));
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}