import { ResolveFn } from '@angular/router';

export const authResolver: ResolveFn<string> = (route, state) => {
  const to = route.queryParamMap.get('to');
  return to ?? '';
};
