import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { LoaderService } from '../_services/loader.service';
import { delay, finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderSrv = inject(LoaderService);

  loaderSrv.open();

  return next(req).pipe(
    // delay(1500),
    finalize(() => {
      loaderSrv.close();
    })
  );
};
