import {ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {RouletteService} from "../../services/roulette.service";
import {Observable, Subscription, tap} from "rxjs";
import {RouletteResponseDTO} from "../../models/roulette-response-dto";

@Component({
  selector: 'app-hub',
  templateUrl: './hub.component.html',
  styleUrls: ['./hub.component.scss']
})
export class HubComponent implements OnInit {

  public rouletteResponseObs: Observable<RouletteResponseDTO[]>

  @ViewChild('scrollViewport', { static: false }) scrollViewportRef!: ElementRef;

  private pageWidth: number = 0;
  private screenResizeDebounceTimeout: ReturnType<typeof setTimeout> | null = null;
  private rouletteResponseSubscription: Subscription;

  // Standard use state - cards on the screen, nothing happening
  public readonly DEFAULT_PAGESTATE: number = 0;

  // A re-roll animation is in progress
  public readonly REROLLING_PAGESTATE: number = 1;

  // A purge (of the old cards) is in progress
  public readonly PURGING_PAGESTATE: number = 2;

  public pageState: number = this.REROLLING_PAGESTATE;

  public cards: RouletteResponseDTO[] = [];

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.screenResizeDebounceTimeout) {
      clearTimeout(this.screenResizeDebounceTimeout);
    }

    this.screenResizeDebounceTimeout = setTimeout(() => {
      this.pageWidth = window.innerWidth;
      this.centerSelectedCard();
    }, 300); // 300ms debounce
  }

  public constructor(
      private rouletteService: RouletteService,
      private changeDetectorRef: ChangeDetectorRef
  ) {}

  public scrollOffset: number = 500;
  public selectedCardIndex: number = -7;
  public numberOfFakeCards: number = 20;
  public numberOfRealCards: number = 5;

  public generateCards(aResponse: RouletteResponseDTO[]): RouletteResponseDTO[] {
    let listOfCards: RouletteResponseDTO[] = [];
    // Generate the first half of the set of fake cards
    for (let i = 0; i < this.numberOfFakeCards / 2; i++) {
      // Create a fake card entry
      let newCard = new RouletteResponseDTO();
      listOfCards.push(newCard)
    }

    // Add the real cards to the array of cards
    for (let realCard of aResponse) {
      // Add a real card entry
      listOfCards.push(realCard);
    }

    // Generate the final half of the set of fake cards
    for (let i = 0; i < this.numberOfFakeCards / 2; i++) {
      // Create a fake card entry
      let newCard = new RouletteResponseDTO();
      listOfCards.push(newCard)
    }

    return listOfCards;
  }

  public ngOnInit() {
    this.pageWidth = window.innerWidth;

    this.rouletteResponseObs = this.rouletteService.getRouletteResults();

    // Populate the list of cards with fake and real items
    this.reRoll();
  }

  public userSelectCard(index: number): void {
    // Stop the user from selecting fake cards by setting a ceiling and floor for what can be selected
    let minScrollableIndex: number = this.numberOfFakeCards / 2;
    let maxScrollableIndex: number = minScrollableIndex + this.numberOfRealCards - 1;

    if (index > maxScrollableIndex) {
      // The user shifted the index to the right of the last real card, go to the first real card
      this.selectedCardIndex = minScrollableIndex;
    } else if (index < minScrollableIndex) {
      // The user shifted the index to the left of the first real card, go to the last real card
      this.selectedCardIndex = maxScrollableIndex;
    } else {
      this.selectedCardIndex = index;
    }
    this.centerSelectedCard();
    setTimeout(()=>{
    }, 100);
  }

  public systemSelectCard(index: number): void {
    this.selectedCardIndex = index;
    this.centerSelectedCard();
  }

  public centerSelectedCard(): void {
    let cardWidth: number = 0;

    if (this.pageWidth < 640) {
      cardWidth = 250;
    } else {
      cardWidth = 302;
    }

    const gap = 12; // gap-3 is 0.75rem = 12px
    const paddingX = 24; // from px-3

    const totalCardWidth = cardWidth + gap;
    const viewportWidth = this.pageWidth;

    const cardCenter = paddingX + (this.selectedCardIndex * totalCardWidth) + (cardWidth / 2);
    const desiredOffset = (viewportWidth / 2) - cardCenter;

    this.scrollOffset = desiredOffset;
  }

  public reRoll(): void {
    this.rouletteResponseObs.subscribe((aResponse: RouletteResponseDTO[])=>{
      if (aResponse) {
        // Change the page-state to update the css and animation speeds for a re-roll
        this.pageState = this.REROLLING_PAGESTATE;

        // Determine if this is the first roll
        let isFirstRoll: boolean = (this.cards.length == 0);

        // Add a set of new cards to the list of cards
        this.cards.push(...this.generateCards(aResponse));
        this.changeDetectorRef.detectChanges();

        // Update the selected card index
        setTimeout(() => {
          // Determine which card in the index is the center of the set of real cards
          if (isFirstRoll) {
            this.selectCenterRealFirstTime();
          } else {
            this.selectCenterRealNthTime();
          }

          // Purge the stale (old) cards once the animation has completed
          setTimeout(() => {
            // The re-roll animation at this point should've completed - purge the old cards
            if (!isFirstRoll) {
              this.destroyStaleCards();
            }
            // THIS HAS TO BE DELAYED TO GIVE THE INDEX A CHANCE TO UPDATE
            setTimeout(()=>{
              // The re-roll process is fully complete, return page-state to default for user navigation
              this.pageState = this.DEFAULT_PAGESTATE;
            },10)
          }, 3000);
        }, 100);
      }
    })
  }

  public destroyStaleCards(): void {
    // Disable horizontal scroll animations
    this.pageState = this.PURGING_PAGESTATE;

    // Purge the state cards from the array and poke Angular change detection to update the *ngFor contents
    let cardsToRemove: number = this.numberOfRealCards + this.numberOfFakeCards;
    this.cards.splice(0, cardsToRemove);
    this.selectedCardIndex = Math.max(0, this.selectedCardIndex - cardsToRemove);

    // The cards were just purged, select the center real after purge
    this.selectCenterRealFirstTime();
    this.changeDetectorRef.detectChanges();
  }

  public getOpacityFromOffset() {
    // Clamp offset between -200 and 500
    const clampedOffset = Math.max(-200, Math.min(500, this.scrollOffset));

    // Calculate opacity: -200 = 1.0 (100%), 500 = 0.0 (0%)
    // Linear interpolation between the two points
    const opacity = 1 - ((clampedOffset - (-200)) / (500 - (-200)));

    // Ensure opacity stays between 0 and 1
    return Math.max(0, Math.min(1, opacity));
  }

  public selectCenterRealFirstTime(): void {
    this.systemSelectCard(
        (this.numberOfFakeCards / 2) + Math.floor(this.numberOfRealCards / 2)
    );
  }

  public selectCenterRealNthTime(): void {
    this.systemSelectCard(
        (this.numberOfFakeCards + this.numberOfRealCards) +
        (this.numberOfFakeCards / 2) +
        Math.floor(this.numberOfRealCards / 2)
    );
  }
}
