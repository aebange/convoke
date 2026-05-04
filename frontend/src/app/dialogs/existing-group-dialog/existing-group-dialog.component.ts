import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DialogRef} from "@angular/cdk/dialog";

@Component({
  selector: 'app-existing-group-dialog',
  templateUrl: './existing-group-dialog.component.html',
  styleUrls: ['./existing-group-dialog.component.scss']
})
export class ExistingGroupDialogComponent implements OnInit {

  public groupForm: FormGroup;

  public constructor(
    private dialogRef: DialogRef,
    private formBuilder: FormBuilder,
  ) {
  }

  public ngOnInit() {
    this.groupForm = this.formBuilder.group({
      groupName: [null, Validators.required],
      groupPassword: [null, Validators.required]
    })
  }

  public closeDialogClicked(): void {
      this.dialogRef.close();
    }

  public continueClicked(): void {
    this.dialogRef.close();
  }
}
