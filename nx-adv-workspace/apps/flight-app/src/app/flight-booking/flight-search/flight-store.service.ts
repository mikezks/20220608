import { Injectable } from '@angular/core';
import { Flight, FlightService } from '@flight-workspace/flight-lib';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, withLatestFrom, map, switchMap, tap } from 'rxjs';


interface Filter {
  from: string;
  to: string;
  urgent: boolean;
}

interface LocalState {
  filters: Filter[];
  flights: Flight[];
}

const initialLocalState: LocalState = {
  filters: [],
  flights: []
}


@Injectable({
  providedIn: 'root'
})
export class FlightStoreService extends ComponentStore<LocalState> {
  /**
   * Updaters
   */

   addFilter = this.updater(
    (state, filter: Filter) => ({
      ...state,
      filters: [
        ...state.filters,
        filter
      ]
    })
  );

  setFlights = this.updater(
    (state, flights: Flight[]) => ({
      ...state,
      flights
    })
  );

  /**
   * Selectors
   */

  selectFilters$ = this.select(
    state => state.filters
  );

  selectFlights$ = this.select(
    state => state.flights
  );

  selectViewModel$ = this.select(
    // Selectors
    this.selectFilters$,
    this.selectFlights$,
    (filters, flights) => ({
      flights,
      filter: filters[filters.length-1]
    })
  );

  /**
   * Effects
   */

  searchFlights = this.effect(
    (trigger$: Observable<void>) =>
      trigger$.pipe(
        withLatestFrom(this.selectFilters$),
        map(([, filters]) => filters[filters.length-1]),
        switchMap(filter => this.flightService.find(
          filter.from,
          filter.to,
          filter.urgent
        )),
        tap(flights => this.setFlights(flights))
      )
  );

  constructor(
    private flightService: FlightService
  ) {
    super();
    this.setState(initialLocalState);
  }
}
