import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateAsAgo',
  standalone: true,
})
export class DateAsAgoPipe implements PipeTransform {
  transform(value: string | Date | number | null, ...args: unknown[]): string {
    if (!value) {
      return 'a long time ago';
    }

    // Value to timestamp
    if (typeof value === 'object' && value instanceof Date) {
      value = value.getTime();
    } else {
      value = new Date(value).getTime();
    }

    let time = (Date.now() - value) / 1000;

    if (time < 10) {
      return 'just now';
    } else if (time < 60) {
      return 'a moment ago';
    }

    const divider = [60, 60, 24, 30, 12];
    const string = [' second', ' minute', ' hour', ' day', ' month', ' year'];

    let i;
    for (i = 0; Math.floor(time / divider[i]) > 0; i++) {
      time /= divider[i];
    }
    const plural = Math.floor(time) > 1 ? 's' : '';

    return Math.floor(time) + string[i] + plural + ' ago';
  }
}
