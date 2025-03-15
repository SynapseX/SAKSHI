import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Session } from '../_models/Session';

const apiUrl = 'http://localhost:8000';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor(private http: HttpClient) {}

  createSession(session: Session) {
    return this.http.post(`${apiUrl}/sessions`, {
      uid: 'assssasasasasasa',
      duration: session.sessionDuration,
      metadata: { ...session },
    });
  }

  getSession(sessionId: string) {
    return this.http.get(`${apiUrl}/sessions/${sessionId}`);
  }

  terminateSession(sessionId: string) {
    return this.http.delete(`${apiUrl}/sessions/${sessionId}`);
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
