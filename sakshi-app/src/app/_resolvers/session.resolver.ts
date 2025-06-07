import { ISessionOutput } from '@/_models/Session';
import { SessionService } from '@/_services/session.service';
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

export const sessionResolver: ResolveFn<ISessionOutput | null> = (route, state) => {
  const sessionId = route.paramMap.get('sessionId') || '';
  const router = inject(Router);

  if (!sessionId) {
    router.navigate(['/sessions']);
  }

  const sessSrv = inject(SessionService);
  return sessSrv.getSessionById(sessionId).pipe(catchError(() => of(null)));
};
