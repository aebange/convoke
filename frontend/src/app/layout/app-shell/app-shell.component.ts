import { ChangeDetectionStrategy, Component } from '@angular/core';
import { animate, query, style, transition, trigger } from "@angular/animations";
import { RouterOutlet } from "@angular/router";
import { NavService } from "../../services/nav.service";

@Component({
  selector: 'app-app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  // NOTE: OnPush prevents ExpressionChangedAfterItHasBeenCheckedError caused by
  // getRouteAnimation() returning undefined on first check then a route string
  // after the outlet activates — both happen within the same change detection cycle
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('routeSlide', [
      transition((fromState: string, toState: string) => toState?.endsWith('-left'), [
        query(':enter, :leave', [
          style({ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' })
        ], { optional: true }),
        query(':enter', [
          style({ transform: 'translateX(100%)', opacity: 0 })
        ], { optional: true }),
        query(':leave', [
          animate('100ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({ transform: 'translateX(-100%)', opacity: 0 }))
        ], { optional: true }),
        query(':enter', [
          animate('100ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({ transform: 'translateX(0)', opacity: 1 }))
        ], { optional: true }),
      ]),
      transition((fromState: string, toState: string) => toState?.endsWith('-right'), [
        query(':enter, :leave', [
          style({ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' })
        ], { optional: true }),
        query(':enter', [
          style({ transform: 'translateX(-100%)', opacity: 0 })
        ], { optional: true }),
        query(':leave', [
          animate('100ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({ transform: 'translateX(100%)', opacity: 0 }))
        ], { optional: true }),
        query(':enter', [
          animate('100ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({ transform: 'translateX(0)', opacity: 1 }))
        ], { optional: true }),
      ]),
    ])
  ]
})
export class AppShellComponent {

  public constructor(private navService: NavService) {}

  public getRouteAnimation(outlet: RouterOutlet): string | undefined {
    if (!outlet.isActivated) return undefined;
    const page: string = outlet.activatedRouteData['animation'] ?? outlet.activatedRoute.snapshot.url[0]?.path;
    return `${page}-${this.navService.slideDirection$.getValue()}`;
  }
}
