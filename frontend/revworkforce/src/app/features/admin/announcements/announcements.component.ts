import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AdminAnnouncementsComponent implements OnInit {
  announcements = signal<any[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  editMode = signal(false);
  currentAnnouncement: any = { id: null, title: '', content: '' };

  constructor(
    private announcementService: AnnouncementService,
    public auth: AuthService
  ) {}

  ngOnInit() { this.loadAnnouncements(); }

  loadAnnouncements() {
    this.announcementService.getAllAnnouncements().subscribe({
      next: (data) => { this.announcements.set(data); this.isLoading.set(false); },
      error: () => { this.announcements.set([]); this.isLoading.set(false); }
    });
  }

  openAddModal() {
    this.editMode.set(false);
    this.currentAnnouncement = { id: null, title: '', content: '' };
    this.showModal.set(true);
  }

  openEditModal(announcement: any) {
    this.editMode.set(true);
    this.currentAnnouncement = { ...announcement };
    this.showModal.set(true);
  }

  saveAnnouncement() {
    if (this.editMode()) {
      this.announcementService.updateAnnouncement(this.currentAnnouncement.id, this.currentAnnouncement).subscribe({
        next: () => { this.showModal.set(false); this.loadAnnouncements(); },
        error: () => alert('Failed to update announcement')
      });
    } else {
      this.announcementService.createAnnouncement(this.currentAnnouncement).subscribe({
        next: () => { this.showModal.set(false); this.loadAnnouncements(); },
        error: () => alert('Failed to create announcement')
      });
    }
  }

  deleteAnnouncement(id: number) {
    if (!confirm('Delete this announcement?')) return;
    this.announcementService.deleteAnnouncement(id).subscribe({
      next: () => this.loadAnnouncements(),
      error: () => alert('Failed to delete announcement')
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
