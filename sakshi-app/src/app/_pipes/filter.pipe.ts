import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true,
})
export class FilterPipe implements PipeTransform {
  transform(value: any[], searchTerm: string, propertyName?: string): any[] {
    if (!value || !searchTerm) {
      return value;
    }

    searchTerm = searchTerm.toLowerCase();

    return value.filter((item) => {
      if (propertyName) {
        return item[propertyName].toLowerCase().includes(searchTerm);
      } else {
        // Filter across all string properties if no propertyName is specified
        return Object.values(item).some((val) => typeof val === 'string' && val.toLowerCase().includes(searchTerm));
      }
    });
  }
}
