import {Component, Input} from '@angular/core';
import {RouletteResponseDTO} from "../../models/roulette-response-dto";

@Component({
  selector: 'app-place-card',
  templateUrl: './place-card.component.html',
  styleUrls: ['./place-card.component.scss']
})
export class PlaceCardComponent {
  @Input() card: RouletteResponseDTO;

  public constructor() {
  }


  public openGame() {
  }

  public getColorScaleHex(value: bigint): string {
    const clampedValue = Math.max(0, Math.min(100000, Number(value)));

    if (clampedValue <= 100) {
      return '#00ff00'; // Pure green
    }

    const factor = (clampedValue - 100) / (100000 - 100);
    const red = 255;
    const green = Math.round(255 * (1 - factor)) + Math.round(128 * factor); // Adds more green for pink
    const blue = Math.round(128 * factor); // Add blue for coral/pink effect

    // Convert to hex
    const redHex = red.toString(16).padStart(2, '0');
    const greenHex = Math.min(255, green).toString(16).padStart(2, '0');
    const blueHex = blue.toString(16).padStart(2, '0');

    return `#${redHex}${greenHex}${blueHex}`;
  }
}
