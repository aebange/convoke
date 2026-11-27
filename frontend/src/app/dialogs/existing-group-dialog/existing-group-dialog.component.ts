import {Component, DestroyRef, OnInit} from '@angular/core';
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
      .subscribe((status: string) => this.togglePassword(status));

    this.groupForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loginError = null;
      });
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

  public retryGroupNameCheck(): void {
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
