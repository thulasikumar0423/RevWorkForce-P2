import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  @Input() role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN' = 'EMPLOYEE';

  constructor(public auth: AuthService) {}

  ngOnInit() {
    const actualRole = this.auth.getRole();

    if (actualRole === 'ADMIN' || actualRole === 'MANAGER' || actualRole === 'EMPLOYEE') {
      this.role = actualRole as any;
    }
  }

  logout() {
    this.auth.logout();
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
