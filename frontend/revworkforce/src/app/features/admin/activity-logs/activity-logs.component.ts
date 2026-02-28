import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ActivityService } from '../../../core/services/activity.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.css']
})
export class ActivityLogsComponent implements OnInit {
  activities = signal<any[]>([]);
  filteredActivities = signal<any[]>([]);
  isLoading = signal(true);
  searchTerm = '';

  constructor(
    private activityService: ActivityService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.loadActivities();
  }

  loadActivities() {
    this.activityService.getAllActivities().subscribe({
      next: (data) => {
        this.activities.set(data);
        this.filteredActivities.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.activities.set([]);
        this.filteredActivities.set([]);
        this.isLoading.set(false);
      }
    });
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredActivities.set(this.activities());
    } else {
      const lower = this.searchTerm.toLowerCase();
      this.filteredActivities.set(
        this.activities().filter(a => 
          a.action?.toLowerCase().includes(lower) ||
          a.userName?.toLowerCase().includes(lower) ||
          a.userRole?.toLowerCase().includes(lower)
        )
      );
    }
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
