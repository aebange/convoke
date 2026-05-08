import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
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
