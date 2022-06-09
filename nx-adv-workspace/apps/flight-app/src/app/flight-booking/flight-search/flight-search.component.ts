/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit } from '@angular/core';
import { Flight, FlightService } from '@flight-workspace/flight-lib';
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { delay, map, Observable, of, switchMap, tap, withLatestFrom } from 'rxjs';
import * as fromFlightBooking from '../+state';


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


@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
  providers: [
    ComponentStore
  ]
})
export class FlightSearchComponent implements OnInit {

  from = 'Hamburg'; // in Germany
  to = 'Graz'; // in Austria
  urgent = false;
  flights$ = this.globalStore.select(fromFlightBooking.selectActiveUserFlights);

  // "shopping basket" with selected flights
  basket: { [id: number]: boolean } = {
    3: true,
    5: true
  };

  /**
   * Updaters
   */

  addFilter = this.localStore.updater(
    (state, filter: Filter) => ({
      ...state,
      filters: [
        ...state.filters,
        filter
      ]
    })
  );

  setFlights = this.localStore.updater(
    (state, flights: Flight[]) => ({
      ...state,
      flights
    })
  );

  /**
   * Selectors
   */

  selectFilters$ = this.localStore.select(
    state => state.filters
  );

  selectFlights$ = this.localStore.select(
    state => state.flights
  );

  selectViewModel$ = this.localStore.select(
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

  searchFlights = this.localStore.effect(
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
    private globalStore: Store<fromFlightBooking.FlightBookingRootState>,
    private localStore: ComponentStore<LocalState>,
    private flightService: FlightService) {

    this.localStore.setState(initialLocalState);
  }

  ngOnInit() {

    this.addFilter(of({
      from: 'London',
      to: 'New York',
      urgent: this.urgent
    }).pipe(
      delay(3_000)
    ));
  }

  search(): void {
    if (!this.from || !this.to) return;

    this.addFilter({
      from: this.from,
      to: this.to,
      urgent: this.urgent
    });

    this.searchFlights();

    this.globalStore.dispatch(
      fromFlightBooking.flightsLoad({
        from: this.from,
        to: this.to,
        urgent: this.urgent
      })
    );
  }

  delay(flight: Flight): void {
    this.globalStore.dispatch(
      fromFlightBooking.flightUpdate({
        flight: {
          ...flight,
          date: addMinutesToDate(flight.date, 15).toISOString(),
          delayed: true
        }
      })
    );
  }
}


export const addMinutesToDate = (date: Date | string, minutes: number): Date => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Date(dateObj.getTime() + minutes * 60 * 1_000);
};
