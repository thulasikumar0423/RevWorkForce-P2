import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-holidays',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.css']
})
export class HolidaysComponent implements OnInit {

  // ================= STATE =================
  holidays = signal<any[]>([]);
  isLoading = signal(true);

  showModal = signal(false);
  showCreateModal = this.showModal;   // template compatibility

  isEditing = signal(false);
  editingId: number | null = null;
  isSaving = signal(false);

  successMsg = signal('');
  errorMsg = signal('');

  // ================= FORM =================
  form = {
    name: '',
    holidayDate: ''
  };

  // template compatibility
  currentHoliday = this.form;

  constructor(
    private empService: EmployeeService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.load();
  }

  // ================= LOAD =================
  load() {
  this.isLoading.set(true);

  this.empService.getHolidays().subscribe({
    next: d => {

      const list = Array.isArray(d) ? d : [];

      const formatted = list.map(h => {
        let parsedDate = null;

        if (h.holidayDate) {
          // If backend sends yyyy-MM-dd → works directly
          if (h.holidayDate.includes('-') && h.holidayDate.length === 10) {
            parsedDate = new Date(h.holidayDate);
          }
          // If backend sends dd-MM-yyyy
          else if (h.holidayDate.includes('-')) {
            const parts = h.holidayDate.split('-');
            parsedDate = new Date(
              +parts[2],      // year
              +parts[1] - 1,  // month
              +parts[0]       // day
            );
          }
        }

        return {
          ...h,
          holidayDate: parsedDate
        };
      });

      this.holidays.set(formatted);
      this.isLoading.set(false);
    },
    error: () => {
      this.holidays.set([]);
      this.isLoading.set(false);
    }
  });
}

  // ================= OPEN MODAL =================
  openCreate() {
    this.form = { name: '', holidayDate: '' };
    this.currentHoliday = this.form;
    this.isEditing.set(false);
    this.editingId = null;
    this.showModal.set(true);
  }

  openAddModal() {
    this.openCreate();
  }

  openEdit(h: any) {
    this.form = { name: h.name, holidayDate: h.holidayDate };
    this.currentHoliday = this.form;
    this.isEditing.set(true);
    this.editingId = h.id;
    this.showModal.set(true);
  }

  // ================= SAVE =================
  save() {
    if (!this.form.name || !this.form.holidayDate) {
      this.showError('Name and date are required.');
      return;
    }

    this.isSaving.set(true);

    const obs =
      this.isEditing() && this.editingId
        ? this.empService.updateHoliday(this.editingId, this.form)
        : this.empService.addHoliday(this.form);

    obs.subscribe({
      next: () => {
        this.load();
        this.showModal.set(false);
        this.showSuccess('Holiday saved!');
        this.isSaving.set(false);
      },
      error: () => {
        this.showError('Failed to save.');
        this.isSaving.set(false);
      }
    });
  }

  saveHoliday() {
    this.save();
  }

  // ================= DELETE =================
  delete(id: number) {
    if (!confirm('Delete this holiday?')) return;

    this.empService.deleteHoliday(id).subscribe({
      next: () => {
        this.load();
        this.showSuccess('Holiday deleted.');
      },
      error: () => this.showError('Failed to delete.')
    });
  }

  deleteHoliday(id: number) {
    this.delete(id);
  }

  // ================= UTILITIES =================
  formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  getMonthYear(date: string) {
    const d = new Date(date);
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
  }

  getInitials(name: string) {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase();
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