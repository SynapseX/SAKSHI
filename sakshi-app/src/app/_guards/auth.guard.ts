import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { map } from 'rxjs';

import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../_services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authSrv = inject(AuthService);
  const tSrv = inject(ToastrService);

  return authSrv.currentUser$.pipe(
    map((user) => {
      if (user && Object.keys(user).length !== 0) {
        return true;
      } else {
        tSrv.error('Unauthorized!');
        return false;
      }
    })
  );
};
