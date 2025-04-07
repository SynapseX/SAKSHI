import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Observable, take, map } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { User as U } from '../_models/User';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authSrv = inject(AuthService);
  const auth = getAuth();

  const user$: Observable<User | null> = new Observable<User | null>(
    (observer) => {
      onAuthStateChanged(auth, (user) => {
        observer.next(user);
        if (user) {
          user.getIdToken().then((token) => {
            const userObj: U = {
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              uid: user.uid,
              accessToken: token,
            };
            authSrv.setUser(userObj);
          });
        }
        observer.complete();
      });
    }
  ).pipe(take(1));

  return user$.pipe(
    map((user) => {
      if (user) {
        return true;
      } else {
        router.navigate(['/auth'], {
          queryParams: {
            ref: router.url,
            to: state.url,
          },
        });
        return false;
      }
    })
  );
};
