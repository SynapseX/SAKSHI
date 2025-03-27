import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToastrService } from 'ngx-toastr';
import { DateAsAgoPipe } from '../../_utils/date-as-ago.pipe';
import { SessionService } from '../../_services/session.service';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-sess',
  standalone: true,
  imports: [
    DateAsAgoPipe,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ModalComponent,
  ],
  templateUrl: './sess.component.html',
})
export class SessComponent {
  @Input() session: any;

  deleteModalData = {
    open: false,
    sessionId: '',
    sessionTitle: '',
  };

  constructor(private sessSrv: SessionService, private tstSrv: ToastrService) {}

  initiateDeleteSession(session_id: string, session_title: string = '') {
    this.deleteModalData.open = true;
    this.deleteModalData.sessionId = session_id;
    this.deleteModalData.sessionTitle = session_title;
  }

  cancelDeleteSession() {
    this.deleteModalData.open = false;
    this.deleteModalData.sessionId = '';
    this.deleteModalData.sessionTitle = '';
  }

  deleteSession() {
    if (this.deleteModalData.sessionId) {
      this.sessSrv.terminateSession(this.deleteModalData.sessionId).subscribe({
        next: (res) => {
          console.log(res);
          this.tstSrv.success(res.message, this.deleteModalData.sessionTitle);
        },
        complete: () => {
          this.cancelDeleteSession();
        },
      });
    }
  }
}
