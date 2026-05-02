import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'shortNumber' })
export class ShortNumberPipe implements PipeTransform {
  transform(value: bigint | number | string): string {
    if (value == null) return '';

    // Convert to bigint if it's not already
    let bigintValue: bigint;
    if (typeof value === 'bigint') {
      bigintValue = value;
    } else if (typeof value === 'string') {
      bigintValue = BigInt(value);
    } else {
      bigintValue = BigInt(value);
    }

    if (bigintValue < 1000n) return bigintValue.toString();
    if (bigintValue < 1_000_000n) {
      const divided = Number(bigintValue) / 1_000;
      return divided.toFixed(1).replace(/\.0$/, '') + 'k';
    }
    if (bigintValue < 1_000_000_000n) {
      const divided = Number(bigintValue) / 1_000_000;
      return divided.toFixed(1).replace(/\.0$/, '') + 'm';
    }
    if (bigintValue < 1_000_000_000_000n) {
      const divided = Number(bigintValue) / 1_000_000_000;
      return divided.toFixed(1).replace(/\.0$/, '') + 'b';
    }

    // For very large numbers (trillions+)
    const divided = Number(bigintValue) / 1_000_000_000_000;
    return divided.toFixed(1).replace(/\.0$/, '') + 't';
  }
}
