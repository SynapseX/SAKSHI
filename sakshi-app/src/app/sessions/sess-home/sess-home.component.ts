import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { LoaderService } from '../../_services/loader.service';
import { SessionService } from '../../_services/session.service';
import { AuthService } from '../../_services/auth.service';

import { SessComponent } from '../sess/sess.component';
import { EmptyBoxComponent } from '../../components/empty-box/empty-box.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sess-home',
  standalone: true,
  imports: [SessComponent, EmptyBoxComponent, MatButtonModule, RouterModule],
  templateUrl: './sess-home.component.html',
  styleUrl: './sess-home.component.scss',
})
export class SessHomeComponent implements OnInit, OnDestroy {
  private sub!: Subscription;
  private sessSub!: Subscription;
  private ldSub!: Subscription;
  isLoading = true;

  activeSessions: Object[] = [];

  constructor(
    private ldSrv: LoaderService,
    private sessSrv: SessionService,
    private authSrv: AuthService
  ) {}

  ngOnInit() {
    this.ldSub = this.ldSrv.loading$.subscribe({
      next: (v) => {
        this.isLoading = v;
      },
    });

    const uid = this.authSrv.getUser()?.uid || '';

    this.sessSub = this.sessSrv.listActiveSessions(uid).subscribe({
      next: (sessions: any) => {
        this.sessSrv.activeSessionsSource.next(sessions.active_sessions);
        console.log(sessions.active_sessions);
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
