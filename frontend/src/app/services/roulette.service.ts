import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {RouletteResponseDTO} from "../models/roulette-response-dto";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RouletteService {

  public constructor(private httpClient: HttpClient) { }

  public getRouletteResults(): Observable<RouletteResponseDTO[]> {
    // Construct the URL for the REST endpoint  (to get the grid preferences for this page)
    const restUrl = environment.baseUrl + `/api/roulette`;

    return this.httpClient.get <RouletteResponseDTO[]> (restUrl)
  }


}
