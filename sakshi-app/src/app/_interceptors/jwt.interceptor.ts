import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { take } from 'rxjs';
import { AuthService } from '../_services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authSrv = inject(AuthService);

  authSrv.currentUser$.pipe(take(1)).subscribe({
    next: (user) => {
      if (user)
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });
    },
  });

  return next(req);
};
