import { ResolveFn } from '@angular/router';

export const authResolver: ResolveFn<boolean> = (route, state) => {
  const to = route.paramMap.get('to');

  console.log(to);

  return to ? true : false;
};
