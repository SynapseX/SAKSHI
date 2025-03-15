import { Component, Input } from '@angular/core';
import { DateAsAgoPipe } from '../../_utils/date-as-ago.pipe';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../_services/session.service';

@Component({
  selector: 'app-sess',
  standalone: true,
  imports: [DateAsAgoPipe, CommonModule],
  templateUrl: './sess.component.html',
  styleUrl: './sess.component.scss',
})
export class SessComponent {
  @Input() session: any;

  constructor(private sessSrv: SessionService) {}

  deleteSession(session_id: string) {
    if (confirm('Are you sure you want to delete this session?')) {
      this.sessSrv.terminateSession(session_id).subscribe({
        next: (res) => {
          console.log(res);
        },
      });
    }
  }
}
