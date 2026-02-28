import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';
import { LeaveService } from '../../../core/services/leave.service';

interface Holiday {
  id: number;
  name: string;
  holidayDate: string;
}

@Component({
  selector: 'app-holiday-calendar',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './holiday-calendar.component.html',
  styleUrl: './holiday-calendar.component.css'
})
export class HolidayCalendarComponent implements OnInit {
  holidays = signal<Holiday[]>([]);
  isLoading = signal(true);

  constructor(public auth: AuthService, private leaveService: LeaveService) {}

  ngOnInit() {
    this.leaveService.getAllHolidays().subscribe({
      next: (data: any[]) => {
        this.holidays.set(data.map(h => ({
  id: h.id,
  name: h.name,
  holidayDate: h.holidayDate
})));
        this.isLoading.set(false);
      },
      error: () => {
        this.holidays.set([]);
        this.isLoading.set(false);
      }
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
