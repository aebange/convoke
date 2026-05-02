import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateFormat' })
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    let date: Date;

    // Handle string input (your format: 2025-06-21 20:53:20.948788)
    if (typeof value === 'string') {
      date = new Date(value);
    } else {
      date = value;
    }

    // Check if date is valid
    if (isNaN(date.getTime())) return '';

    // Format as MM/YYYY
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    return `${month}/${year}`;
  }
}
