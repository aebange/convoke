import {Component, HostListener} from '@angular/core';


@Component({
  selector: 'app-select-user',
  templateUrl: './select-user.component.html',
  styleUrls: ['./select-user.component.scss'],
})
export class SelectUserComponent  {
  public isMobile: boolean = false;

  public ngOnInit(): void {
    this.updateLayout();
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    this.updateLayout();
  }

  private updateLayout(): void {
    this.isMobile = window.innerWidth < 1024;
  }
}
