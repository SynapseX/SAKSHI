import { inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs';

import { ToastrService } from 'ngx-toastr';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tSrv = inject(ToastrService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err) {
        switch (err.status) {
          case 400:
            if (err.error.errors) {
              const modelStateErrors = [];
              for (const key of Object.keys(err.error.errors)) {
                if (err.error.errors[key])
                  modelStateErrors.push(err.error.errors[key]);
              }
              throw modelStateErrors.flat();
            } else {
              tSrv.error(err.error.error, `${err.status} Bad Request`);
            }
            break;
          case 401:
            tSrv.error(err?.error?.error || '', `${err.status} Unauthorized`);
            break;
          case 404:
            router.navigateByUrl('/not-found');
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
          default:
            tSrv.error(`The request couldn't be processed at the moment!`);
            console.error(err);
            break;
        }
      }
      throw err;
    })
  );
};
