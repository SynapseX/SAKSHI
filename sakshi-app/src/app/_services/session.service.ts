import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, map, of } from 'rxjs';
import { ISessionInput, ISessionOutput } from '../_models/Session';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  activeSessionsSource = new BehaviorSubject<ISessionOutput[]>([]);
  activeSessions$ = this.activeSessionsSource.asObservable();

  private firstPromptSource = new BehaviorSubject<String>('');
  firstPrompt$ = this.firstPromptSource.asObservable();

  private apiUrl = this.cfgSrv.get('API_BASE_URL');

  constructor(private http: HttpClient, private authSrv: AuthService, private cfgSrv: ConfigService) {}

  createSession(session: ISessionInput) {
    const url = `${this.apiUrl}/sessions`;
    const formData = {
      uid: this.authSrv.getUser()?.uid,
      name: session.name,
      duration: session.sessionDuration,
      treatment_goals: session.treatmentGoals,
      client_expectations: session.clientExpectations,
      session_notes: session.sessionNotes,
      termination_plan: session.terminationPlan,
      review_of_progress: session.reviewOfProgress,
      thank_you_note: session.thankYouNote,
    };

    return this.http.post(url, formData).pipe(
      map((res: any) => {
        const allSessions = [...this.activeSessionsSource.value, res.session];
        this.activeSessionsSource.next(allSessions);
        this.firstPromptSource.next(res.session.first_prompt.first_prompt);
        return res;
      }),
    );
  }

  getSession(sessionId: string) {
    const url = `${this.apiUrl}/sessions/${sessionId}`;
    return this.http.get(url);
  }

  pauseSession(sessionId: string) {
    console.log({ sessionId });
    const url = `${this.apiUrl}/sessions/${sessionId}/pause`;
    return this.http.post(url, {});
  }

  resumeSession(sessionId: string) {
    const url = `${this.apiUrl}/sessions/${sessionId}/resume`;
    return this.http.post(url, {});
  }

  terminateSession(sessionId: string) {
    const url = `${this.apiUrl}/sessions/${sessionId}/complete`;
    return this.http.post(url, {}).pipe(
      map((res: any) => {
        const activeSessions = this.activeSessionsSource.value;
        this.activeSessionsSource.next(activeSessions.filter((s: any) => s.session_id !== sessionId));
        return res;
      }),
    );
  }

  extendSession(sessionId: string, duration: number) {
    const url = `${this.apiUrl}/sessions/${sessionId}/extend?additional_duration=${duration}`;

    if (duration < 5 && duration > 90) return of(new Error('Invalid Duration'));

    return this.http.put(url, {});
  }

  followupSession(oldSessionId: string) {
    const url = `${this.apiUrl}/sessions/${oldSessionId}/followup`;

    return this.http.post(url, {});
  }

  listActiveSessions(uid: string) {
    const url = `${this.apiUrl}/sessions/active/${uid}`;
    return this.http.get<{ active_sessions: ISessionOutput[] }>(url);
  }
}
