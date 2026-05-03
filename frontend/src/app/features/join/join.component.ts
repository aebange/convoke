import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit {

  public groupForm: FormGroup;

  public constructor(
    private formBuilder: FormBuilder
  ) {
  }


  public ngOnInit() {
    this.groupForm = this.formBuilder.group({
      groupName: [null, Validators.required]
    })
  }
}
