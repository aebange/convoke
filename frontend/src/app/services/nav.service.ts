import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NavService {
  public slideDirection$: BehaviorSubject<string> = new BehaviorSubject<string>('left');

  public setDirection(direction: string): void {
    this.slideDirection$.next(direction);
  }
}
