/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Flight } from '@flight-workspace/flight-lib';
import { Store } from '@ngrx/store';
import { delay, of } from 'rxjs';
import * as fromFlightBooking from '../+state';
import { FlightStoreService } from './flight-store.service';


@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
  providers: [
    FlightStoreService
  ]
})
export class FlightSearchComponent implements OnInit, AfterViewInit {

  from = 'Hamburg'; // in Germany
  to = 'Graz'; // in Austria
  urgent = false;
  flights$ = this.globalStore.select(fromFlightBooking.selectActiveUserFlights);
  vm$ = this.localStore.selectViewModel$;
  evilProperty = 0;

  // "shopping basket" with selected flights
  basket: { [id: number]: boolean } = {
    3: true,
    5: true
  };

  constructor(
    private globalStore: Store<fromFlightBooking.FlightBookingRootState>,
    private localStore: FlightStoreService) {

    this.evilProperty = 1;
  }

  ngAfterViewInit(): void {
    /**
     * Abarbeitung in aynchrone Event-Verarbeitung verschieben
     * -> neuer ApplicationRef.tick() ChangeDetection Run
     *
     *  -- oder --
     *
     * Vor dem Binding der Daten abarbeiten lassen
     */
    setTimeout(
      () => this.evilProperty = 2
    );
  }

  ngOnInit() {

    this.localStore.addFilter(of({
      from: 'London',
      to: 'New York',
      urgent: this.urgent
    }).pipe(
      delay(3_000)
    ));
  }

  search(): void {
    if (!this.from || !this.to) return;

    this.localStore.addFilter({
      from: this.from,
      to: this.to,
      urgent: this.urgent
    });

    this.localStore.searchFlights();

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
