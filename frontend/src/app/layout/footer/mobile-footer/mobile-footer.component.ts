import {Component} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs";
import {NavService} from "../../../services/nav.service";

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-mobile-footer',
  templateUrl: './mobile-footer.component.html',
  styleUrls: ['./mobile-footer.component.scss']
})
export class MobileFooterComponent {
  public navItems: NavItem[] = [
    {label: 'Events', icon: 'fa-calendar', route: 'events'},
    {label: 'Members', icon: 'fa-user-group', route: 'members'},
    {label: 'Votes', icon: 'fa-check-to-slot', route: 'votes'},
    {label: 'Profile', icon: 'fa-user-cog', route: 'profile'},
  ];

  public activeRoute: string = 'events';

  public constructor(
    private router: Router,
    private navService: NavService,
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const navEnd = event as NavigationEnd;
      const segment: string = navEnd.url.split('/').pop() ?? '';
      this.activeRoute = segment;
    });
  }

  public isActive(item: NavItem): boolean {
    return this.activeRoute === item.route;
  }

  public navigate(item: NavItem): void {
    const currentIndex: number = this.navItems.findIndex(n => n.route === this.activeRoute);
    const nextIndex: number = this.navItems.findIndex(n => n.route === item.route);

    const direction: string = nextIndex > currentIndex ? 'left' : 'right';
    this.navService.setDirection(direction);

    const urlSegments: string[] = this.router.url.split('/');
    const groupId: string = urlSegments[urlSegments.indexOf('page') + 1];

    this.router.navigate(['/page', groupId, item.route]);
  }
}
