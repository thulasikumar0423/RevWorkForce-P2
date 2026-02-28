import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-designations',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './designations.component.html',
  styleUrls: ['./designations.component.css']
})
export class DesignationsComponent implements OnInit {
  designations = signal<any[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  editMode = signal(false);
  currentDesig: any = { id: null, title: '', description: '' };

  constructor(
    private employeeService: EmployeeService,
    public auth: AuthService
  ) {}

  ngOnInit() { this.loadDesignations(); }

  loadDesignations() {
    this.employeeService.getDesignations().subscribe({
      next: (data) => { this.designations.set(data); this.isLoading.set(false); },
      error: () => { this.designations.set([]); this.isLoading.set(false); }
    });
  }

  openAddModal() {
    this.editMode.set(false);
    this.currentDesig = { id: null, title: '', description: '' };
    this.showModal.set(true);
  }

  openEditModal(desig: any) {
    this.editMode.set(true);
    this.currentDesig = { ...desig };
    this.showModal.set(true);
  }

  saveDesignation() {
    if (this.editMode()) {
      this.employeeService.updateDesignation(this.currentDesig.id, this.currentDesig).subscribe({
        next: () => { this.showModal.set(false); this.loadDesignations(); },
        error: () => alert('Failed to update designation')
      });
    } else {
      this.employeeService.addDesignation(this.currentDesig).subscribe({
        next: () => { this.showModal.set(false); this.loadDesignations(); },
        error: () => alert('Failed to add designation')
      });
    }
  }

  deleteDesignation(id: number) {
    if (!confirm('Delete this designation? This cannot be undone.')) return;
    this.employeeService.deleteDesignation(id).subscribe({
      next: () => this.loadDesignations(),
      error: () => alert('Cannot delete designation with existing employees')
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
