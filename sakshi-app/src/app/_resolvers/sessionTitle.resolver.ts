import { SessionService } from '@/_services/session.service';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';

export const sessionTitleResolver: ResolveFn<string> = (route, state) => {
  const sessionId = route.paramMap.get('sessionId') || '';

  if (!sessionId) {
    return 'Meeting with SAKSHI | SAKSHI.AI';
  }

  const sessSrv = inject(SessionService);

  return sessSrv.getSessionById(sessionId).pipe(
    map((s) => {
      return `Meeting [${s.title.session_title}] | SAKSHI.AI`;
    }),
  );
};
