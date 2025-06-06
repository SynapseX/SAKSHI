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
  allSessionsSource = new BehaviorSubject<ISessionOutput[]>([]);
  allSessions$ = this.allSessionsSource.asObservable();

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
        const allSessions = [...this.allSessionsSource.value, res.session];
        this.allSessionsSource.next(allSessions);
        this.firstPromptSource.next(res.session.first_prompt.first_prompt);
        return res;
      }),
    );
  }

  getSessionById(sessionId: string) {
    const url = `${this.apiUrl}/sessions/${sessionId}`;
    return this.http.get(url);
  }

  pauseSessionById(sessionId: string) {
    console.log({ sessionId });
    const url = `${this.apiUrl}/sessions/${sessionId}/pause`;
    return this.http.post(url, {});
  }

  resumeSessionById(sessionId: string) {
    const url = `${this.apiUrl}/sessions/${sessionId}/resume`;
    return this.http.post(url, {});
  }

  terminateSessionById(sessionId: string) {
    const url = `${this.apiUrl}/sessions/${sessionId}/complete`;
    return this.http.post(url, {}).pipe(
      map((res: any) => {
        const allSessions = this.allSessionsSource.value;
        this.allSessionsSource.next(allSessions.filter((s: any) => s.session_id !== sessionId));
        return res;
      }),
    );
  }

  extendSessionById(sessionId: string, duration: number) {
    const url = `${this.apiUrl}/sessions/${sessionId}/extend?additional_duration=${duration}`;

    if (duration < 5 && duration > 90) return of(new Error('Invalid Duration'));

    return this.http.put(url, {});
  }

  followupSession(oldSessionId: string) {
    const url = `${this.apiUrl}/sessions/${oldSessionId}/followup`;

    return this.http.post(url, {});
  }

  listSessionsByUser(uid: string, status: string = '') {
    const url = `${this.apiUrl}/sessions/list/${uid}?status=${status}`;
    return this.http.get<{ sessions: ISessionOutput[] }>(url);
  }
}
