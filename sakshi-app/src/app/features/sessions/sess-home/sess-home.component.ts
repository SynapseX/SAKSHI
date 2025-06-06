import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, map } from 'rxjs';
import { RouterModule } from '@angular/router';

import { LoaderService } from '@/_services/loader.service';
import { SessionService } from '@/_services/session.service';
import { AuthService } from '@/_services/auth.service';

import { ISessionOutput } from '@/_models/Session';
import { MatButtonModule } from '@angular/material/button';
import { EmptyBoxComponent } from '@/components/empty-box/empty-box.component';
import { SessionCardComponent } from '../session-card/session-card.component';
import { CommonModule } from '@angular/common';
import { FilterPipe } from '@/_pipes/filter.pipe';

@Component({
  selector: 'app-sess-home',
  standalone: true,
  imports: [SessionCardComponent, EmptyBoxComponent, MatButtonModule, RouterModule, FilterPipe],
  templateUrl: './sess-home.component.html',
  styleUrl: './sess-home.component.scss',
})
export class SessHomeComponent implements OnInit, OnDestroy {
  private sub!: Subscription;
  private sessSub!: Subscription;
  private ldSub!: Subscription;
  isLoading = true;

  // otherSessions: ISessionOutput[] = [];
  // activeSessions: ISessionOutput[] = [];

  allSessions: ISessionOutput[] = [];

  constructor(private ldSrv: LoaderService, private sessSrv: SessionService, private authSrv: AuthService) {}

  ngOnInit() {
    this.ldSub = this.ldSrv.loading$.subscribe({
      next: (v) => {
        this.isLoading = v;
      },
    });

    const uid = this.authSrv.getUser()?.uid || '';

    this.sessSub = this.sessSrv.listSessionsByUser(uid).subscribe({
      next: (res) => {
        console.log({ sessions: res.sessions });
        this.sessSrv.allSessionsSource.next(res.sessions);
      },
    });

    this.sub = this.sessSrv.allSessions$.subscribe({
      next: (sessions) => {
        this.allSessions = sessions;
      },
    });
  }

  updateSessionUI(sessionUpdate: { updateType: string; session: ISessionOutput }) {
    this.allSessions[this.allSessions.findIndex((s) => s.session_id === sessionUpdate.session.session_id)] =
      sessionUpdate.session;
  }

  filterSessions(status = '', include = true) {
    if (status) {
      return include
        ? this.allSessions.filter((s) => s.status === status)
        : this.allSessions.filter((s) => s.status !== status);
    }
    return [];
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.sessSub.unsubscribe();
    this.ldSub.unsubscribe();
  }
}
