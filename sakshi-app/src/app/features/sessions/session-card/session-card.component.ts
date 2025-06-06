import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { ISessionOutput } from '@/_models/Session';
import { SessionService } from '@/_services/session.service';
import { ModalComponent } from '@/components/modal/modal.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { formatDateTime, formatDuration, minutes } from '@/_utils';

interface OnUpdateType {
  updateType: 'pause' | 'resume' | 'complete' | 'ui';
  session: ISessionOutput;
}

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
  @Output() onUpdate = new EventEmitter<OnUpdateType>();

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

  initiateDeleteSession() {
    this.deleteModalData = {
      sessionId: this.session.session_id,
      sessionTitle: this.session.title.session_title,
    };
  }

  cancelDeleteSession() {
    this.deleteModalData = {
      sessionId: '',
      sessionTitle: '',
    };
  }

  deleteSession() {
    if (this.deleteModalData.sessionId) {
      this.sessSrv.terminateSessionById(this.deleteModalData.sessionId).subscribe({
        next: (res) => {
          console.log({ complete: res });
          this.tstSrv.success(res.message, this.deleteModalData.sessionTitle);
          this.session.status = 'completed';
          this.emitSession('complete');
        },
        complete: () => {
          this.cancelDeleteSession();
        },
      });
    }
  }

  initiateExtendSession() {
    this.extendModalData.sessionId = this.session.session_id;
    this.extendModalData.sessionTitle = this.session.title.session_title;
  }

  cancelExtendSession() {
    this.extendModalData = {
      sessionId: '',
      sessionTitle: '',
      additional_duration: 5,
    };
  }

  extendSession() {
    const { sessionId, sessionTitle, additional_duration } = this.extendModalData;

    if (sessionId && minutes.includes(additional_duration)) {
      this.sessSrv.extendSessionById(sessionId, additional_duration).subscribe({
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

  pauseSession() {
    this.sessSrv.pauseSessionById(this.session.session_id).subscribe({
      next: (res: any) => {
        console.log({ pause: res });
        this.tstSrv.success(`${this.session.title.session_title} Paused`);
        this.session.status = 'paused';
        this.emitSession('pause');
      },
    });
  }

  resumeSession() {
    this.sessSrv.resumeSessionById(this.session.session_id).subscribe({
      next: (res: any) => {
        console.log({ resume: res });
        this.tstSrv.success(`${this.session.title.session_title} Resumed`);
        this.session.status = 'active';
        this.emitSession('resume');
      },
    });
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

  emitSession(updateType: OnUpdateType['updateType']) {
    this.onUpdate.emit({
      updateType,
      session: this.session,
    });
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
