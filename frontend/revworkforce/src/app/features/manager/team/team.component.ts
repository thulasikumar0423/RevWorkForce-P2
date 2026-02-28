import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { LeaveService } from '../../../core/services/leave.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {
  teamMembers = signal<any[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');
  searchTerm = signal('');
  selectedMember = signal<any | null>(null);
  showProfile = signal(false);

  constructor(
    private employeeService: EmployeeService,
    private leaveService: LeaveService,
    public auth: AuthService
  ) {}

  ngOnInit() { this.loadTeam(); }

  loadTeam() {
    this.isLoading.set(true);
    this.errorMsg.set('');
    this.employeeService.getMyTeam().subscribe({
      next: (data: any) => {
        const members = Array.isArray(data) ? data : [];
        this.teamMembers.set(members);
        this.isLoading.set(false);
        // Enrich each member with their leave balance from backend
        members.forEach((m: any) => {
          this.leaveService.getEmployeeLeaveBalance(m.id).subscribe({
            next: (balances: any) => {
              const list = Array.isArray(balances) ? balances : [];
              const totalRemaining = list.reduce((sum: number, b: any) => sum + (b.remaining || b.availableDays || 0), 0);
              this.teamMembers.update(all => all.map(tm =>
                tm.id === m.id ? { ...tm, leaveBalance: totalRemaining } : tm
              ));
            },
            error: () => {} // leave balance unavailable for this member — skip silently
          });
        });
      },
      error: () => {
        this.teamMembers.set([]);
        this.errorMsg.set('Failed to load team members. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  get filtered() {
    const t = this.searchTerm().toLowerCase();
    return this.teamMembers().filter(m =>
      !t ||
      m.name?.toLowerCase().includes(t) ||
      (`${m.firstName || ''} ${m.lastName || ''}`).toLowerCase().includes(t) ||
      m.designationTitle?.toLowerCase().includes(t) ||
      m.departmentName?.toLowerCase().includes(t)
    );
  }

openProfile(member: any) {
  this.employeeService.getEmployeeById(member.id).subscribe({
    next: (fullUser) => {
      this.selectedMember.set(fullUser);
      this.showProfile.set(true);
    },
    error: () => alert('Failed to load profile details')
  });
}
  closeProfile()           { this.showProfile.set(false); this.selectedMember.set(null); }

  getMemberName(m: any): string {
    if (m.name) return m.name;
    const fn = m.firstName || '';
    const ln = m.lastName || '';
    return `${fn} ${ln}`.trim() || m.email || 'Unknown';
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  }

  getAvatarColor(name: string): string {
    const colors = ['linear-gradient(135deg,#3b82f6,#1d4ed8)', 'linear-gradient(135deg,#10b981,#059669)',
      'linear-gradient(135deg,#8b5cf6,#6d28d9)', 'linear-gradient(135deg,#f59e0b,#d97706)',
      'linear-gradient(135deg,#ec4899,#be185d)', 'linear-gradient(135deg,#14b8a6,#0d9488)'];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  }

  getExperience(joiningDate: string): string {
    if (!joiningDate) return 'N/A';
    const years = new Date().getFullYear() - new Date(joiningDate).getFullYear();
    return years < 1 ? 'Less than a year' : `${years} year${years > 1 ? 's' : ''}`;
  }

  get activeMembersCount(): number {
    return this.teamMembers().filter(m => m.active === true || m.status === 'ACTIVE').length;
  }
}
