import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pagination'
})
export class PaginationPipe implements PipeTransform {

  transform(value: number): number[] {
    return Array.from({ length: value }, (_, i) => i);
  }
}
