import {AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of, switchMap, timer} from 'rxjs';
import {environment} from '../../environments/environment';

const GROUP_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
const NAME_CHECK_DEBOUNCE_MS = 400;

interface GroupNameAvailability {
  name: string;
  exists: boolean;
  available: boolean;
  message: string;
}

export function passwordMinLength(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value : '';
    if (value.length === 0) {
      return null;
    }
    return value.length >= min
      ? null
      : {passwordMinLength: {requiredLength: min, actualLength: value.length}};
  };
}

export function passwordContainsLetter(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value : '';
    if (value.length === 0) {
      return null;
    }
    return /[A-Za-z]/.test(value) ? null : {passwordLetter: true};
  };
}

export function passwordContainsNumber(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value : '';
    if (value.length === 0) {
      return null;
    }
    return /\d/.test(value) ? null : {passwordNumber: true};
  };
}

/**
 * Verifies that the entered group name exists (case-insensitively) before the password field
 * is unlocked. The endpoint treats the lookup case-insensitively.
 */
export function groupExistsValidator(http: HttpClient): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const raw = typeof control.value === 'string' ? control.value.trim() : '';

    // Empty or malformed names are reported by the synchronous validators.
    if (!raw || !GROUP_NAME_PATTERN.test(raw)) {
      return of(null);
    }

    return timer(NAME_CHECK_DEBOUNCE_MS).pipe(
      switchMap(() => http.get<GroupNameAvailability>(
        `${environment.baseUrl}/api/groups/check-name`,
        {params: {name: raw}}
      )),
      map((response: GroupNameAvailability) => response.exists ? null : {groupNotFound: true}),
      catchError(() => of({checkFailed: true}))
    );
  };
}
