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

@Component({
  selector: 'app-sess-home',
  standalone: true,
  imports: [SessionCardComponent, EmptyBoxComponent, MatButtonModule, RouterModule],
  templateUrl: './sess-home.component.html',
  styleUrl: './sess-home.component.scss',
})
export class SessHomeComponent implements OnInit, OnDestroy {
  private sub!: Subscription;
  private sessSub!: Subscription;
  private ldSub!: Subscription;
  isLoading = true;

  activeSessions: ISessionOutput[] = [];
  otherSessions: ISessionOutput[] = [];

  constructor(private ldSrv: LoaderService, private sessSrv: SessionService, private authSrv: AuthService) {}

  ngOnInit() {
    this.ldSub = this.ldSrv.loading$.subscribe({
      next: (v) => {
        this.isLoading = v;
      },
    });

    const uid = this.authSrv.getUser()?.uid || '';

    this.sessSub = this.sessSrv.listActiveSessions(uid).subscribe({
      next: (res) => {
        const sessions = res.active_sessions;
        console.log({ sessions });
        this.otherSessions = sessions.filter((s) => s.status !== 'active');
        this.sessSrv.activeSessionsSource.next(sessions.filter((s) => s.status === 'active'));
      },
    });

    this.sub = this.sessSrv.activeSessions$.subscribe({
      next: (sessions) => {
        this.activeSessions = sessions;
      },
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.sessSub.unsubscribe();
    this.ldSub.unsubscribe();
  }
}
