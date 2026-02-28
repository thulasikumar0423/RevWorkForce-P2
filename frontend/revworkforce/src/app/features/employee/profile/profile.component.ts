import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  // ================= STATE =================
  profile = signal<any>(null);
  isLoading = signal(true);
  isEditing = signal(false);
  isSaving = signal(false);

  successMsg = signal('');
  errorMsg = signal('');

  showPasswordSection = signal(false);
  passwordError = signal<string | null>(null);

  // ================= PASSWORD FORM =================
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  private changingPassword = false;

  isChangingPassword() {
    return this.changingPassword;
  }

  // ================= PROFILE EDIT FORM =================
  editForm = {
    phone: '',
    address: '',
    emergencyContact: ''
  };

  // Alias used by template
  editData = this.editForm;

  constructor(
    private employeeService: EmployeeService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  // ================= LOAD PROFILE =================
  loadProfile() {
    this.isLoading.set(true);

    this.employeeService.getMyProfile().subscribe({
      next: d => {
        this.profile.set(d);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMsg.set('Failed to load profile.');
      }
    });
  }

  // ================= EDIT PROFILE =================
  startEdit() {
    const p = this.profile();
    this.editForm = {
      phone: p?.phone || '',
      address: p?.address || '',
      emergencyContact: p?.emergencyContact || ''
    };
    this.editData = this.editForm;
    this.isEditing.set(true);
  }

  toggleEdit() {
    this.startEdit();
  }

  saveProfile() {
    this.isSaving.set(true);

    this.employeeService.updateMyProfile(this.editForm).subscribe({
      next: d => {
        this.profile.set(d);
        this.isEditing.set(false);
        this.isSaving.set(false);
        this.successMsg.set('Profile updated successfully!');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMsg.set('Failed to update profile.');
      }
    });
  }

  // ================= PASSWORD CHANGE =================
 changePassword() {

  // Validation
  if (!this.passwordData.currentPassword ||
      !this.passwordData.newPassword ||
      !this.passwordData.confirmPassword) {
    this.passwordError.set('All fields are required.');
    return;
  }

  if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
    this.passwordError.set('Passwords do not match.');
    return;
  }

  this.changingPassword = true;

  this.employeeService.changePassword({
    oldPassword: this.passwordData.currentPassword,
    newPassword: this.passwordData.newPassword
  }).subscribe({
    next: () => {
      this.changingPassword = false;
      this.showPasswordSection.set(false);
      this.passwordError.set(null);

      this.successMsg.set('Password changed successfully!');
      setTimeout(() => this.successMsg.set(''), 3000);

      // Reset form
      this.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    },
    error: err => {
      this.changingPassword = false;
      this.passwordError.set(
        err?.error?.message || 'Failed to change password.'
      );
    }
  });
}

  // ================= UTILITIES =================
  getInitials(name?: string): string {
    if (name) {
      return name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    }

    const p = this.profile();
    if (!p) return '?';

    return `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`
      .toUpperCase() || '?';
  }

  getFullName(): string {
    const p = this.profile();
    return p
      ? `${p.firstName || ''} ${p.lastName || ''}`.trim()
      : '';
  }

}