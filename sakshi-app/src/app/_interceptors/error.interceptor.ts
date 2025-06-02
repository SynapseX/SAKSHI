import { inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { ToastrService } from 'ngx-toastr';

export const IGNORED_STATUSES = new HttpContextToken<number[]>(() => []);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tSrv = inject(ToastrService);

  const ignoredStatuses = req.context.get(IGNORED_STATUSES);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (ignoredStatuses?.includes(err.status)) {
        // rethrow error to be catched locally
        return throwError(() => err);
      }

      if (err) {
        switch (err.status) {
          case 400:
            tSrv.error(`Request couldn't be processed`);
            break;
          case 401:
            tSrv.error(err.error.detail || '', `${err.status} Unauthorized`);
            break;
          case 403:
            console.error(err.error.detail);
            break;
          case 404:
            // router.navigateByUrl('/not-found');
            break;
          case 500:
            const navigationExtras: NavigationExtras = {
              state: { error: err.error },
              queryParams: {
                ref: router.url,
              },
            };
            router.navigateByUrl('/server-error', navigationExtras);
            break;
          case 0:
            tSrv.error('Come back later', 'Something Happened !');
            break;
          default:
            console.log('DEFAULT_ERR', err);
            break;
        }
      }
      throw err;
    }),
  );
};
