import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, map } from 'rxjs';
import { Session } from '../_models/Session';
import { environment } from '../../environments/environment.development';
import { AuthService } from './auth.service';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  activeSessionsSource = new BehaviorSubject<Object[]>([]);
  activeSessions$ = this.activeSessionsSource.asObservable();

  constructor(private http: HttpClient, private authSrv: AuthService) {}

  createSession(session: Session) {
    return this.http
      .post(`${apiUrl}/sessions`, {
        uid: this.authSrv.getUser()?.uid,
        duration: session.sessionDuration,
        metadata: { ...session },
      })
      .pipe(
        map((res: any) => {
          const allSessions = [...this.activeSessionsSource.value, res.session];
          this.activeSessionsSource.next(allSessions);
          return res;
        })
      );
  }

  getSession(sessionId: string) {
    return this.http.get(`${apiUrl}/sessions/${sessionId}`);
  }

  terminateSession(sessionId: string) {
    return this.http.delete(`${apiUrl}/sessions/${sessionId}`).pipe(
      map((res: any) => {
        const activeSessions = this.activeSessionsSource.value;
        this.activeSessionsSource.next(
          activeSessions.filter((s: any) => s.session_id !== sessionId)
        );
        return res;
      })
    );
  }

  extendSession(sessionId: string, duration: number) {
    return this.http.put(
      `${apiUrl}/sessions/${sessionId}?additional_duration=${duration}`,
      {}
    );
  }

  listActiveSessions(uid: string) {
    return this.http.get(`${apiUrl}/sessions/active/${uid}`);
  }
}
