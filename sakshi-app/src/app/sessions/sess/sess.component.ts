import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToastrService } from 'ngx-toastr';
import { DateAsAgoPipe } from '../../_utils/date-as-ago.pipe';
import { SessionService } from '../../_services/session.service';

import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sess',
  standalone: true,
  imports: [DateAsAgoPipe, CommonModule, MatButtonModule],
  templateUrl: './sess.component.html',
  styleUrl: './sess.component.scss',
})
export class SessComponent {
  @Input() session: any;

  constructor(private sessSrv: SessionService, private tstSrv: ToastrService) {}

  deleteSession(session_id: string, session_title: string = '') {
    if (confirm('Are you sure you want to delete this session?')) {
      this.sessSrv.terminateSession(session_id).subscribe({
        next: (res) => {
          console.log(res);
          this.tstSrv.success(res.message, session_title);
        },
      });
    }
  }
}
