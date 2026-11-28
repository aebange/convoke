import {Component, DestroyRef, HostListener, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {
  groupExistsValidator,
  passwordContainsLetter,
  passwordContainsNumber,
  passwordMinLength
} from '../../utilities/validators';

@Component({
  selector: 'app-existing-group-dialog',
  templateUrl: './existing-group-dialog.component.html',
  styleUrls: ['./existing-group-dialog.component.scss']
})
export class ExistingGroupDialogComponent implements OnInit {

  public groupForm: FormGroup;
  public submitting = false;
  public loginError: string | null = null;
  public openPopover: 'groupName' | 'password' | null = null;
  public readonly isTouchOnly = typeof window !== 'undefined'
    && window.matchMedia('(hover: none)').matches;
  private popoverCloseTimer: ReturnType<typeof setTimeout> | null = null;

  public constructor(
    private dialogRef: MatDialogRef<ExistingGroupDialogComponent>,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private destroyRef: DestroyRef
  ) {
  }

  public ngOnInit() {
    this.groupForm = this.formBuilder.group({
      groupName: [
        null,
        [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9_-]+$/)],
        [groupExistsValidator(this.http)]
      ],
      groupPassword: [
        {value: null, disabled: true},
        [Validators.required, passwordMinLength(8), passwordContainsLetter(), passwordContainsNumber()]
      ]
    });

    this.groupNameControl.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status: string) => {
        this.togglePassword(status);
      });

    this.groupForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loginError = null;
        this.openPopover = null;
      });

    this.destroyRef.onDestroy(() => this.cancelPopoverClose());
  }

  public get groupNameControl(): FormControl {
    return this.groupForm.get('groupName') as FormControl;
  }

  public get groupPasswordControl(): FormControl {
    return this.groupForm.get('groupPassword') as FormControl;
  }

  public get canSubmit(): boolean {
    return !this.submitting
      && this.groupForm.valid
      && this.groupPasswordControl.enabled;
  }

  public get groupNameStatus(): 'none' | 'pending' | 'valid' | 'invalid' {
    const value = this.groupNameControl.value;
    const hasValue = typeof value === 'string' && value.length > 0;

    if (!hasValue) {
      return 'none';
    }
    if (this.groupNameControl.pending) {
      return 'pending';
    }
    return this.groupNameControl.valid ? 'valid' : 'invalid';
  }

  public get groupNameStatusMessage(): string {
    const control = this.groupNameControl;
    if (control.pending) {
      return 'Checking group name…';
    }
    if (control.hasError('maxlength')) {
      return 'Group name must be 50 characters or fewer';
    }
    if (control.hasError('pattern')) {
      return 'Use letters, numbers, hyphens, or underscores';
    }
    if (control.hasError('groupNotFound')) {
      return 'No group found with that name';
    }
    if (control.hasError('checkFailed')) {
      return 'Could not verify the group name. Tap to retry.';
    }
    if (control.valid) {
      return 'Group found';
    }
    return '';
  }

  public isStatusPopoverVisible(field: 'groupName' | 'password'): boolean {
    const status = field === 'groupName' ? this.groupNameStatus : this.passwordStatus;
    if (status === 'none') {
      return false;
    }
    return this.openPopover === field || (this.isTouchOnly && status === 'invalid');
  }

  public get statusAnnouncement(): string {
    if (this.isStatusPopoverVisible('groupName')) {
      return this.groupNameStatusMessage;
    }
    if (this.isStatusPopoverVisible('password')) {
      return this.passwordStatusMessage;
    }
    return '';
  }

  public onStatusPointerEnter(event: Event, field: 'groupName' | 'password'): void {
    if ((event as PointerEvent).pointerType !== 'mouse') {
      return;
    }
    this.cancelPopoverClose();
    this.openPopover = field;
  }

  public onStatusPointerLeave(event: Event, field: 'groupName' | 'password'): void {
    if ((event as PointerEvent).pointerType !== 'mouse') {
      return;
    }
    this.schedulePopoverClose(field);
  }

  public onStatusPointerUp(event: Event, field: 'groupName' | 'password'): void {
    if ((event as PointerEvent).pointerType === 'mouse') {
      return;
    }
    this.openPopover = this.openPopover === field ? null : field;
  }

  public onPopoverPointerEnter(event: Event): void {
    if ((event as PointerEvent).pointerType === 'mouse') {
      this.cancelPopoverClose();
    }
  }

  public onPopoverPointerLeave(event: Event, field: 'groupName' | 'password'): void {
    if ((event as PointerEvent).pointerType === 'mouse') {
      this.schedulePopoverClose(field);
    }
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-status-popover]')) {
      return;
    }
    this.cancelPopoverClose();
    this.openPopover = null;
  }

  private schedulePopoverClose(field: 'groupName' | 'password'): void {
    this.cancelPopoverClose();
    this.popoverCloseTimer = setTimeout(() => {
      this.popoverCloseTimer = null;
      if (this.openPopover === field) {
        this.openPopover = null;
      }
    }, 250);
  }

  private cancelPopoverClose(): void {
    if (this.popoverCloseTimer !== null) {
      clearTimeout(this.popoverCloseTimer);
      this.popoverCloseTimer = null;
    }
  }

  public get passwordErrorMessage(): string {
    const password = this.groupPasswordControl;
    if (password.hasError('required')) {
      return 'Password is required';
    }
    if (password.hasError('passwordMinLength')) {
      return 'Password must be at least 8 characters';
    }
    if (password.hasError('passwordLetter')) {
      return 'Password must include a letter';
    }
    if (password.hasError('passwordNumber')) {
      return 'Password must include a number';
    }
    return '';
  }

  public get passwordStatus(): 'none' | 'valid' | 'invalid' {
    const control = this.groupPasswordControl;

    if (!control.enabled) {
      return 'none';
    }
    const value = control.value;
    const hasValue = typeof value === 'string' && value.length > 0;
    if (!hasValue) {
      return 'none';
    }
    return control.valid ? 'valid' : 'invalid';
  }

  public get passwordStatusMessage(): string {
    return this.groupPasswordControl.valid
      ? 'Password meets the requirements'
      : this.passwordErrorMessage;
  }

  public retryGroupNameCheck(): void {
    this.cancelPopoverClose();
    this.openPopover = 'groupName';
    this.groupNameControl.updateValueAndValidity();
  }

  public closeDialogClicked(): void {
    this.dialogRef.close();
  }

  public continueClicked(): void {
    if (!this.canSubmit) {
      return;
    }

    this.submitting = true;
    this.loginError = null;

    const groupName = this.groupNameControl.value;
    const password = this.groupPasswordControl.value;

    this.authService.login(groupName, password).subscribe({
      next: (response) => {
        this.submitting = false;
        this.dialogRef.close();
        this.router.navigate(['page/select-user', response.groupId]);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        this.loginError = error.status === 401
          ? 'Invalid group name or password'
          : 'Something went wrong. Please try again.';
      }
    });
  }

  private togglePassword(status: string): void {
    const password = this.groupPasswordControl;

    if (status === 'VALID') {
      password.enable({emitEvent: false});
      return;
    }

    password.disable({emitEvent: false});
    password.reset();
  }
}
