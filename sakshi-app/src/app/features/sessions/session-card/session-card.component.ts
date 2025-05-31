import { ISessionOutput } from '@/_models/Session';
import { SessionService } from '@/_services/session.service';
import { formatDateTime, formatDuration, minutes } from '@/_utils';
import { ModalComponent } from '@/components/modal/modal.component';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-session-card',
  standalone: true,
  templateUrl: './session-card.component.html',
  imports: [
    CommonModule,
    ModalComponent,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
  ],
})
export class SessionCardComponent {
  minutes = minutes;
  @Input() session!: ISessionOutput;

  deleteModalData = {
    sessionId: '',
    sessionTitle: '',
  };

  extendModalData = {
    sessionId: '',
    sessionTitle: '',
    additional_duration: 5,
  };

  constructor(private sessSrv: SessionService, private tstSrv: ToastrService) {}

  initiateDeleteSession(session_id: string, session_title: string = '') {
    this.deleteModalData.sessionId = session_id;
    this.deleteModalData.sessionTitle = session_title;
  }

  cancelDeleteSession() {
    this.deleteModalData.sessionId = '';
    this.deleteModalData.sessionTitle = '';
  }

  deleteSession() {
    if (this.deleteModalData.sessionId) {
      this.sessSrv.terminateSession(this.deleteModalData.sessionId).subscribe({
        next: (res) => {
          console.log({ complete: res });
          this.tstSrv.success(res.message, this.deleteModalData.sessionTitle);
        },
        complete: () => {
          this.cancelDeleteSession();
        },
      });
    }
  }

  initiateExtendSession(session_id: string, session_title: string = '') {
    this.extendModalData.sessionId = session_id;
    this.extendModalData.sessionTitle = session_title;
  }

  cancelExtendSession() {
    this.extendModalData = {
      sessionId: '',
      sessionTitle: '',
      additional_duration: 15,
    };
  }

  extendSession() {
    const { sessionId, sessionTitle, additional_duration } = this.extendModalData;

    if (sessionId && minutes.includes(additional_duration)) {
      this.sessSrv.extendSession(sessionId, additional_duration).subscribe({
        next: (res: any) => {
          console.log({ extend: res });
          this.tstSrv.success(res.message, sessionTitle);
        },
        complete: () => {
          this.cancelExtendSession();
        },
      });
    }
  }

  pauseSession(sessionId: string) {
    if (sessionId) {
      this.sessSrv.pauseSession(sessionId).subscribe({
        next: (res: any) => {
          console.log({ pause: res });
          this.tstSrv.success(res.message);
        },
      });
    }
  }

  followupSession(oldSessionId: string) {
    if (oldSessionId) {
      // TODO: Check if old sessionId is correct on backend
      this.sessSrv.followupSession(oldSessionId).subscribe({
        next: (res: any) => {
          if (Object.hasOwn(res, 'error')) this.tstSrv.error('Create a new Session', 'Unable to Extend');
          else this.tstSrv.success(res.message);
        },
      });
    }
  }

  formatDateTime(dateTime: string): string {
    return formatDateTime(dateTime);
  }

  formatDuration(duration: number): string {
    return formatDuration(duration);
  }

  getBadgeClass(): string {
    switch (this.session.status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'active':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}
