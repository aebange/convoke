import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DialogRef} from "@angular/cdk/dialog";

@Component({
  selector: 'app-create-group-dialog',
  templateUrl: './create-group-dialog.component.html',
  styleUrls: ['./create-group-dialog.component.scss']
})
export class CreateGroupDialogComponent implements OnInit {

  public groupForm: FormGroup;

  public constructor(
    private formBuilder: FormBuilder,
    private dialogRef: DialogRef,
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
