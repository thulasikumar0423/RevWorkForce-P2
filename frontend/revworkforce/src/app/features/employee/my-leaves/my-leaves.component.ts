import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { LeaveService } from '../../../core/services/leave.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeaveApplication } from '../../../core/models/leave.model';

@Component({
  selector: 'app-my-leaves',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterLink],
  templateUrl: './my-leaves.component.html',
  styleUrl: './my-leaves.component.css'
})
export class MyLeavesComponent implements OnInit {
  leaves = signal<LeaveApplication[]>([]);
  isLoading = signal(true);

  constructor(
    private leaveService: LeaveService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.loadLeaves();
  }

  loadLeaves() {
    this.leaveService.getMyLeaves().subscribe({
      next: (data) => {
        this.leaves.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.leaves.set([]);
        this.isLoading.set(false);
      }
    });
  }

  cancelLeave(id: number) {
    if (!confirm('Are you sure you want to cancel this leave?')) return;
    
    this.leaveService.cancelLeave(id).subscribe({
      next: () => {
        // Remove from list and reload to get accurate data
        this.leaves.update(list => list.filter(l => l.id !== id));
      },
      error: () => alert('Failed to cancel leave')
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
