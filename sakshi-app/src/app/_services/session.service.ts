import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, map } from 'rxjs';
import { Session } from '../_models/Session';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  activeSessionsSource = new BehaviorSubject<Object[]>([]);
  activeSessions$ = this.activeSessionsSource.asObservable();

  private firstPromptSource = new BehaviorSubject<String>('');
  firstPrompt$ = this.firstPromptSource.asObservable();

  private apiUrl = this.cfgSrv.get('API_BASE_URL');

  constructor(
    private http: HttpClient,
    private authSrv: AuthService,
    private cfgSrv: ConfigService
  ) {}

  createSession(session: Session) {
    const formData = {
      uid: this.authSrv.getUser()?.uid,
      duration: session.sessionDuration,
      treatment_goals: session.treatmentGoals,
      client_expectations: session.clientExpectations,
      session_notes: session.sessionNotes,
      termination_plan: session.terminationPlan,
      review_of_progress: session.reviewOfProgress,
      thank_you_note: session.thankYouNote,
    };

    return this.http.post(`${this.apiUrl}/sessions`, formData).pipe(
      map((res: any) => {
        const allSessions = [...this.activeSessionsSource.value, res.session];
        this.activeSessionsSource.next(allSessions);
        this.firstPromptSource.next(res.session.first_prompt.first_prompt);
        return res;
      })
    );
  }

  getSession(sessionId: string) {
    return this.http.get(`${this.apiUrl}/sessions/${sessionId}`);
  }

  terminateSession(sessionId: string) {
    return this.http.delete(`${this.apiUrl}/sessions/${sessionId}`).pipe(
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
      `${this.apiUrl}/sessions/${sessionId}?additional_duration=${duration}`,
      {}
    );
  }

  listActiveSessions(uid: string) {
    return this.http.get(`${this.apiUrl}/sessions/active/${uid}`);
  }
}
