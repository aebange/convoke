import {Component, HostListener, OnInit} from '@angular/core';
import {UserItem} from "../../../models/select-user-page/user-item";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-mobile-select-user',
  templateUrl: './mobile-select-user.component.html',
  styleUrls: ['./mobile-select-user.component.scss'],
  animations: [
    trigger('slideAnimation', [
      transition('* => left', [
        style({transform: 'translateX(0)', opacity: 1}),
        animate('150ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({transform: 'translateX(-100%)', opacity: 0}))
      ]),
      transition('* => right', [
        style({transform: 'translateX(0)', opacity: 1}),
        animate('150ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({transform: 'translateX(100%)', opacity: 0}))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({transform: '{{ startX }}', opacity: 0}),
        animate('150ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({transform: 'translateX(0)', opacity: 1}))
      ], {params: {startX: 'translateX(100%)'}})
    ])
  ]
})
export class MobileSelectUserComponent implements OnInit {

  public touchStartX: number = 0;

  private readonly BREAKPOINT_MD: number = 768;
  private readonly BREAKPOINT_XL: number = 1280;

  public memberSelected: boolean = false;
  public selectedMember: UserItem | null = null;

  // Page 0 always has one fewer slot for the Add Member button
  private readonly FIRST_PAGE_REDUCTION: number = 1;

  public currentPage: number = 0;
  public displayPage: number = 0;
  public isAnimating: boolean = false;
  public slideDirection: string = 'left';
  public incomingVisible: boolean = false;

  public initialized: boolean = false;

  // Page 0 holds one fewer member to accommodate the hardcoded Add Member button
  private firstPageSize: number = 3;
  private defaultPageSize: number = 4;


  public members: UserItem[] = [
    {id: 1, displayName: 'Andrew', avatar: '#22C55E'},
    {id: 2, displayName: 'Will', avatar: '#22C55E'},
    {id: 3, displayName: 'Derek', avatar: '#22C55E'},
    {id: 4, displayName: 'Maddie', avatar: '#22C55E'},
    {id: 5, displayName: 'Mike', avatar: '#22C55E'},
    {id: 6, displayName: 'Alex', avatar: '#22C55E'},
    {id: 7, displayName: 'Hana', avatar: '#22C55E'},
    {id: 8, displayName: 'Kent', avatar: '#22C55E'},
    {id: 9, displayName: 'Gillian', avatar: '#22C55E'},
  ];

  private getColumnsForCurrentBreakpoint(): number {
    const width: number = window.innerWidth;
    if (width >= this.BREAKPOINT_XL) return 4; // 4x2 grid
    if (width >= this.BREAKPOINT_MD) return 3; // 3x2 grid
    return 2;                                  // 2x2 grid (mobile default)
  }

  private updatePageSize(): void {
    const columns: number = this.getColumnsForCurrentBreakpoint();
    // 2 rows per page regardless of breakpoint
    this.defaultPageSize = columns * 2;
    this.firstPageSize = this.defaultPageSize - this.FIRST_PAGE_REDUCTION;

    // Clamp currentPage in case the new page size means fewer total pages
    const clampedPage: number = Math.min(this.currentPage, this.totalPages - 1);
    if (clampedPage !== this.currentPage) {
      this.currentPage = clampedPage;
      this.displayPage = clampedPage;
    }
  }

  private getMembersForPage(page: number): UserItem[] {
    if (page === 0) {
      return this.members.slice(0, this.firstPageSize);
    }
    const start: number = this.firstPageSize + ((page - 1) * this.defaultPageSize);
    return this.members.slice(start, start + this.defaultPageSize);
  }

  public ngOnInit() {
    this.updatePageSize();
    setTimeout(() => this.initialized = true, 0);
  }

  public openAddMember(): void {
  }

  public get pagedMembers(): UserItem[] {
    return this.getMembersForPage(this.displayPage);
  }

  public get totalPages(): number {
    // Math.max prevents negative remainders when the member count is less than firstPageSize
    const remainingAfterFirstPage: number = Math.max(0, this.members.length - this.firstPageSize);
    return 1 + Math.ceil(remainingAfterFirstPage / this.defaultPageSize);
  }

  public goToPage(page: number): void {
    if (this.isAnimating || page === this.currentPage) return;
    this.slideDirection = page > this.currentPage ? 'left' : 'right';
    this.isAnimating = true;
    this.incomingVisible = false;
    this.currentPage = page;
  }

  public onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  public onTouchEnd(event: TouchEvent): void {
    const swipeDistance: number = event.changedTouches[0].screenX - this.touchStartX;

    // Math.abs converts the swipe distance to a positive number so we can threshold
    // it regardless of swipe direction — negative means left, positive means right
    const swipeDistanceAbsolute: number = Math.abs(swipeDistance);
    if (swipeDistanceAbsolute < 50) return;

    if (swipeDistance < 0 && this.currentPage < this.totalPages - 1) {
      this.goToPage(this.currentPage + 1);
    } else if (swipeDistance > 0 && this.currentPage > 0) {
      this.goToPage(this.currentPage - 1);
    }
  }

  public onAnimationDone(): void {
    this.displayPage = this.currentPage;
    this.isAnimating = false;
    this.incomingVisible = true;
  }


  public selectMember(member: UserItem): void {
    this.selectedMember = member;
    this.memberSelected = true;
  }

  public goBackToUserSelection(): void {
    this.memberSelected = false;
    this.selectedMember = null;
  }

  public openUserSession(): void {

  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    this.updatePageSize();
  }
}
