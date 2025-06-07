import { routes } from './app.routes';
import { provideToastr } from 'ngx-toastr';
import { ApplicationConfig } from '@angular/core';
import { TitleStrategy, provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';

import { errorInterceptor } from './_interceptors/error.interceptor';
import { jwtInterceptor } from './_interceptors/jwt.interceptor';
import { loadingInterceptor } from './_interceptors/loading.interceptor';
import { DynamicTitleStrategy } from './_services/dynamic-title.strategy';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MAT_ICON_DEFAULT_OPTIONS, MatIconDefaultOptions } from '@angular/material/icon';

const appearance: MatFormFieldDefaultOptions = {
  appearance: 'outline', // Or 'fill', 'standard', 'legacy'
  floatLabel: 'auto', // Or 'always', 'never'
  hideRequiredMarker: false, // Or true
};

const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 100,
  hideDelay: 100,
  touchendHideDelay: 100,
};

const iconOptions: MatIconDefaultOptions = {
  fontSet: 'material-symbols-rounded',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([errorInterceptor, jwtInterceptor, loadingInterceptor])),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-bottom-center',
      preventDuplicates: true,
    }),
    provideAnimationsAsync(),
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: appearance },
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults },
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: iconOptions },
    { provide: TitleStrategy, useClass: DynamicTitleStrategy },
  ],
};
