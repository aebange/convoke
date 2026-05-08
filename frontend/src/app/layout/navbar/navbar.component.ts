import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
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
