import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, map } from 'rxjs';
import { Session } from '../_models/Session';
import {API_BASE_URL}  from  "./api-config-constants";

const apiUrl = API_BASE_URL;


@Injectable({
  providedIn: 'root',
})
export class SessionService {
  activeSessionsSource = new BehaviorSubject<Object[]>([]);
  activeSessions$ = this.activeSessionsSource.asObservable();

  constructor(private http: HttpClient) {}

  createSession(session: Session) {
    return this.http
      .post(`${apiUrl}/sessions`, {
        uid: 'assssasasasasasa',
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
