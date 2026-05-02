import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ErrorDialogComponent} from "./errorHandler/error-dialog/error-dialog.component";
import {ErrorService} from "./errorHandler/error.service";
import {ErrorDialogFormData} from "./errorHandler/error-dialog-form-data";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private errorDialogIsOpen: boolean = false;
  private errorDialogRef:    MatDialogRef<ErrorDialogComponent>;

  public constructor(
                     private errorService: ErrorService,
                     private matDialog: MatDialog) {}

  public ngOnInit(): void {
    this.errorService.getErrorsAsObservable().subscribe( (aError: HttpErrorResponse) => {
      // An error came in.  So, display the error in a popup

      // Create the form data object (to pass-in to the dialog box)
      let errorFormData: ErrorDialogFormData = new ErrorDialogFormData();
      errorFormData.error_text = aError.statusText;
      errorFormData.status_code = aError.status
      errorFormData.url = aError.url;

      if (typeof aError.error === 'object') {
        // The aError.error is an object.  So, pull the error from aError.error.message
        errorFormData.message = aError.error.message;
      }
      else {
        // The aError.error is not an object.  So, pull the error from aError.error
        errorFormData.message = aError.error;
      }

      if (this.errorDialogIsOpen) {
        // The error dialog is already open -- so close it
        this.errorDialogRef.close(false);
      }

      this.errorDialogIsOpen = true;

      // Open the Error Dialog
      // Do not set the height of dialog boxes.  Let them grow
      this.errorDialogRef = this.matDialog.open(ErrorDialogComponent, {
        minWidth: '400px',
        maxWidth: '800px',
        data: errorFormData
      });

      this.errorDialogRef.afterClosed().subscribe(() => {
        // The error dialog box has closed
        this.errorDialogIsOpen = false;
      });

    });
  }

}
