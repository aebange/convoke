import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DialogRef} from "@angular/cdk/dialog";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ExistingGroupDialogComponent} from "../../dialogs/existing-group-dialog/existing-group-dialog.component";
import {CreateGroupDialogComponent} from "../../dialogs/create-group-dialog/create-group-dialog.component";

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit {



  public constructor(

    private dialog: MatDialog
  ) {
  }

  public ngOnInit() {

  }

  public existingGroupClicked(): void {
    let existingGroupDialogRef: MatDialogRef<ExistingGroupDialogComponent> = this.dialog.open(ExistingGroupDialogComponent, {
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      autoFocus: false
    })
  }

  public createGroupClicked(): void {
    let createGroupDialogRef: MatDialogRef<CreateGroupDialogComponent> = this.dialog.open(CreateGroupDialogComponent, {
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      autoFocus: false
    })
  }
}
